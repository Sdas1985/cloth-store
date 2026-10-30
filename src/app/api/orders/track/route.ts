import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import { Order, OrderItem } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { reference, phone } = await req.json();

    if (!reference || typeof reference !== 'string') {
      return NextResponse.json({ success: false, error: 'Reference required' }, { status: 400 });
    }

    const cleanRef = reference.trim().toUpperCase();

    let orderQuery = 'SELECT * FROM orders WHERE UPPER(public_reference) = ?';
    let params: any[] = [cleanRef];

    if (phone) {
      orderQuery += ' AND customer_phone LIKE ?';
      params.push(`%${phone.trim().slice(-10)}%`);
    }

    const order = await queryOne<Order>(orderQuery, params);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'কোনো অর্ডার পাওয়া যায়নি। রেফারেন্স নম্বরটি যাচাই করুন।' },
        { status: 404 }
      );
    }

    const items = await query<OrderItem>(
      'SELECT id, product_name, variant_details, sku, unit_price, quantity, total_price, image_url FROM order_items WHERE order_id = ?',
      [order.id]
    );

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        public_reference: order.public_reference,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        district_name: order.district_name,
        delivery_address: order.delivery_address,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        fulfillment_status: order.fulfillment_status,
        subtotal: order.subtotal,
        delivery_charge: order.delivery_charge,
        total_amount: order.total_amount,
        created_at: order.created_at,
      },
      items,
    });
  } catch (error) {
    console.error('Order tracking API error:', error);
    return NextResponse.json({ success: false, error: 'সার্ভার ত্রুটি' }, { status: 500 });
  }
}
