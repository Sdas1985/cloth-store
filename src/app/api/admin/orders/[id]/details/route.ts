import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { queryOne, query } from '@/lib/db';
import { Order, OrderItem } from '@/lib/types';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const orderId = Number(id);

    const order = await queryOne<Order>('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // 1. Line items
    const items = await query<OrderItem>('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

    // 2. Customer profile & history
    const customer = await queryOne(
      'SELECT * FROM customers WHERE phone = ?',
      [order.customer_phone]
    );

    // 3. Related orders with same phone
    const relatedOrders = await query<Order>(
      'SELECT id, public_reference, total_amount, fulfillment_status, created_at FROM orders WHERE customer_phone = ? AND id != ? ORDER BY id DESC LIMIT 5',
      [order.customer_phone, orderId]
    );

    // 4. Block status
    const blockRecord = await queryOne(
      'SELECT * FROM blocked_customers WHERE phone = ? AND is_active = 1',
      [order.customer_phone]
    );

    return NextResponse.json({
      success: true,
      order,
      items,
      customer,
      relatedOrders,
      isBlocked: Boolean(blockRecord),
      blockRecord,
    });
  } catch (err) {
    console.error('Order details error:', err);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
