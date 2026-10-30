import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { execute } from '@/lib/db';
import { normalizeBangladeshiPhone } from '@/lib/phone';

export async function POST(req: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone number required' }, { status: 400 });
    }

    const normalizedPhone = normalizeBangladeshiPhone(phone);

    await execute(
      'UPDATE blocked_customers SET is_active = 0 WHERE phone = ?',
      [normalizedPhone]
    );

    await execute(
      "UPDATE customers SET fraud_status = 'clean' WHERE phone = ?",
      [normalizedPhone]
    );

    // Audit log
    await execute(
      `INSERT INTO admin_audit_logs (admin_user_id, admin_name, action, target_type, target_id, details)
       VALUES (?, ?, 'unblock_customer', 'fraud', ?, ?)`,
      [admin.userId, admin.name, normalizedPhone, `Unblocked phone: ${normalizedPhone}`]
    );

    return NextResponse.json({ success: true, message: 'Customer ordering eligibility restored' });
  } catch (err) {
    console.error('Fraud unblock error:', err);
    return NextResponse.json({ success: false, error: 'Failed to unblock customer' }, { status: 500 });
  }
}
