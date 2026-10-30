import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { normalizeBangladeshiPhone } from '@/lib/phone';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionToken,
      customerName,
      customerPhone,
      districtId,
      deliveryAddress,
      orderNote,
      items,
      estimatedTotal,
      checkoutStage,
      marketingConsent,
    } = body;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Session token is required' }, { status: 400 });
    }

    const normalizedPhone = customerPhone ? normalizeBangladeshiPhone(customerPhone) : null;
    const itemsJson = items ? JSON.stringify(items) : '[]';

    const existing = await queryOne<{ id: number; status: string }>(
      'SELECT id, status FROM checkout_sessions WHERE session_token = ?',
      [sessionToken]
    );

    if (existing) {
      // If already converted, do not revert to abandoned
      const newStatus = existing.status === 'converted' ? 'converted' : 'abandoned';
      await execute(
        `UPDATE checkout_sessions 
         SET customer_name = COALESCE(?, customer_name),
             customer_phone = COALESCE(?, customer_phone),
             district_id = COALESCE(?, district_id),
             delivery_address = COALESCE(?, delivery_address),
             order_note = COALESCE(?, order_note),
             items_snapshot = COALESCE(?, items_snapshot),
             estimated_total = COALESCE(?, estimated_total),
             checkout_stage = COALESCE(?, checkout_stage),
             status = ?,
             marketing_consent = COALESCE(?, marketing_consent),
             last_active_at = CURRENT_TIMESTAMP
         WHERE session_token = ?`,
        [
          customerName || null,
          normalizedPhone,
          districtId || null,
          deliveryAddress || null,
          orderNote || null,
          itemsJson,
          estimatedTotal || null,
          checkoutStage || 'contact_entered',
          newStatus,
          marketingConsent ? 1 : 0,
          sessionToken,
        ]
      );
    } else {
      await execute(
        `INSERT INTO checkout_sessions (
          session_token, customer_name, customer_phone, district_id,
          delivery_address, order_note, items_snapshot, estimated_total,
          checkout_stage, status, marketing_consent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'abandoned', ?)`,
        [
          sessionToken,
          customerName || null,
          normalizedPhone,
          districtId || null,
          deliveryAddress || null,
          orderNote || null,
          itemsJson,
          estimatedTotal || 0,
          checkoutStage || 'contact_entered',
          marketingConsent ? 1 : 0,
        ]
      );
    }

    return NextResponse.json({ success: true, sessionToken });
  } catch (error) {
    console.error('Checkout session sync error:', error);
    return NextResponse.json({ error: 'Session sync failed' }, { status: 500 });
  }
}
