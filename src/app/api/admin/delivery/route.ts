import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { execute, queryOne, withTransaction } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const {
      defaultDeliveryChattogram,
      defaultDeliveryNational,
      freeDeliveryThreshold,
    } = await req.json();

    await withTransaction(async (tx) => {
      await tx.execute(
        `UPDATE store_settings 
         SET default_delivery_chattogram = ?,
             default_delivery_national = ?,
             free_delivery_threshold = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = 1`,
        [
          Number(defaultDeliveryChattogram || 80),
          Number(defaultDeliveryNational || 150),
          Number(freeDeliveryThreshold || 3000),
        ]
      );

      // Also sync delivery_rules table
      await tx.execute(
        'UPDATE delivery_rules SET delivery_charge = ? WHERE district_id = 1',
        [Number(defaultDeliveryChattogram || 80)]
      );
      await tx.execute(
        'UPDATE delivery_rules SET delivery_charge = ? WHERE district_id IS NULL',
        [Number(defaultDeliveryNational || 150)]
      );

      // Audit log
      await tx.execute(
        `INSERT INTO admin_audit_logs (admin_user_id, admin_name, action, target_type, target_id, details)
         VALUES (?, ?, 'update_delivery', 'settings', '1', ?)`,
        [
          admin.userId,
          admin.name,
          `Updated delivery fees: CTG=৳${defaultDeliveryChattogram}, National=৳${defaultDeliveryNational}, Free=৳${freeDeliveryThreshold}`,
        ]
      );
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
