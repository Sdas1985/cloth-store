import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { execute, queryOne } from '@/lib/db';
import { normalizeBangladeshiPhone } from '@/lib/phone';

export async function POST(req: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { phone, reason } = await req.json();

    if (!phone || !reason || reason.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'ব্লক করার কারণ উল্লেখ করা আবশ্যক (Mandatory reason required)' },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizeBangladeshiPhone(phone);

    const existing = await queryOne<{ id: number }>(
      'SELECT id FROM blocked_customers WHERE phone = ?',
      [normalizedPhone]
    );

    if (existing) {
      await execute(
        'UPDATE blocked_customers SET is_active = 1, reason = ?, blocked_by = ? WHERE id = ?',
        [reason.trim(), admin.name, existing.id]
      );
    } else {
      await execute(
        `INSERT INTO blocked_customers (phone, reason, blocked_by, is_active)
         VALUES (?, ?, ?, 1)`,
        [normalizedPhone, reason.trim(), admin.name]
      );
    }

    // Update customer table fraud status
    await execute(
      "UPDATE customers SET fraud_status = 'blocked', fraud_notes = ? WHERE phone = ?",
      [reason.trim(), normalizedPhone]
    );

    // Audit log
    await execute(
      `INSERT INTO admin_audit_logs (admin_user_id, admin_name, action, target_type, target_id, details)
       VALUES (?, ?, 'block_customer', 'fraud', ?, ?)`,
      [admin.userId, admin.name, normalizedPhone, `Blocked phone: ${normalizedPhone}. Reason: ${reason}`]
    );

    return NextResponse.json({ success: true, message: 'Customer successfully blocked' });
  } catch (err) {
    console.error('Fraud block error:', err);
    return NextResponse.json({ success: false, error: 'Failed to block customer' }, { status: 500 });
  }
}
