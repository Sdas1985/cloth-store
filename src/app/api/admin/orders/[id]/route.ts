import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { execute, queryOne, withTransaction } from '@/lib/db';
import { OrderFulfillmentStatus, OrderPaymentStatus } from '@/lib/types';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const orderId = Number(id);

    const body = await req.json();
    const { fulfillmentStatus, paymentStatus, staffNotes, assignedStaffId } = body;

    const existingOrder = await queryOne<any>('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!existingOrder) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    await withTransaction(async (tx) => {
      // If status changed to cancelled, safely return items to inventory
      if (
        fulfillmentStatus === 'cancelled' &&
        existingOrder.fulfillment_status !== 'cancelled'
      ) {
        const orderItems = await tx.query<any>(
          'SELECT * FROM order_items WHERE order_id = ?',
          [orderId]
        );

        for (const item of orderItems) {
          if (item.variant_id) {
            await tx.execute(
              'UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE id = ?',
              [item.quantity, item.variant_id]
            );
          }
          await tx.execute(
            'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
            [item.quantity, item.product_id]
          );

          await tx.execute(
            `INSERT INTO inventory_movements (product_id, variant_id, change_quantity, new_quantity, reason, reference_order_id, created_by)
             VALUES (?, ?, ?, 0, 'order_cancellation', ?, ?)`,
            [item.product_id, item.variant_id, item.quantity, orderId, admin.name]
          );
        }
      }

      await tx.execute(
        `UPDATE orders 
         SET fulfillment_status = COALESCE(?, fulfillment_status),
             payment_status = COALESCE(?, payment_status),
             staff_notes = COALESCE(?, staff_notes),
             assigned_staff_id = COALESCE(?, assigned_staff_id),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          fulfillmentStatus || null,
          paymentStatus || null,
          staffNotes !== undefined ? staffNotes : null,
          assignedStaffId || null,
          orderId,
        ]
      );

      // Audit log
      await tx.execute(
        `INSERT INTO admin_audit_logs (admin_user_id, admin_name, action, target_type, target_id, details)
         VALUES (?, ?, 'update_order', 'order', ?, ?)`,
        [
          admin.userId,
          admin.name,
          String(orderId),
          `Updated status: ${fulfillmentStatus || 'same'}, payment: ${paymentStatus || 'same'}`,
        ]
      );
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Order update error:', err);
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
  }
}
