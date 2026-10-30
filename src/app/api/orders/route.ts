import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { queryOne, query, withTransaction } from '@/lib/db';
import { validateBangladeshiPhone } from '@/lib/phone';
import { calculateDeliveryCharge } from '@/lib/delivery';

const orderItemSchema = z.object({
  productId: z.number(),
  variantId: z.number().nullable().optional(),
  quantity: z.number().min(1).max(99),
});

const placeOrderSchema = z.object({
  customerName: z.string().min(2, 'নাম দেওয়া আবশ্যক (Name is required)'),
  customerPhone: z.string().min(10, '১১ ডিজিটের সঠিক ফোন নম্বর দিন'),
  districtId: z.number().min(1, 'জেলা নির্বাচন করুন'),
  deliveryAddress: z.string().min(5, 'বিস্তারিত ডেলিভারি ঠিকানা লিখুন'),
  orderNote: z.string().optional(),
  items: z.array(orderItemSchema).min(1, 'কমপক্ষে একটি প্রোডাক্ট থাকা আবশ্যক'),
  couponCode: z.string().optional(),
  checkoutSessionId: z.string().optional(),
  marketingConsent: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = placeOrderSchema.safeParse(body);

    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'ভুল তথ্য দেওয়া হয়েছে';
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }

    const data = parseResult.data;

    // 1. Phone validation & normalization
    const phoneValidation = validateBangladeshiPhone(data.customerPhone);
    if (!phoneValidation.isValid) {
      return NextResponse.json(
        { success: false, error: phoneValidation.error || 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন' },
        { status: 400 }
      );
    }
    const normalizedPhone = phoneValidation.normalized;

    // 2. Fraud & Blocklist check
    const isBlocked = await queryOne<{ id: number; reason: string }>(
      'SELECT id, reason FROM blocked_customers WHERE phone = ? AND is_active = 1',
      [normalizedPhone]
    );

    if (isBlocked) {
      return NextResponse.json(
        {
          success: false,
          error:
            'দুঃখিত, এই নম্বরটি থেকে বর্তমানে অর্ডার গ্রহণ সাময়িকভাবে স্থগিত রয়েছে। বিস্তারিত জানতে আমাদের হটলাইনে (01762-556262) যোগাযোগ করুন।',
        },
        { status: 403 }
      );
    }

    // 3. District Verification
    const district = await queryOne<{ id: number; name_en: string; name_bn: string }>(
      'SELECT id, name_en, name_bn FROM districts WHERE id = ? AND is_active = 1',
      [data.districtId]
    );

    if (!district) {
      return NextResponse.json({ success: false, error: 'অবৈধ জেলা নির্বাচন করা হয়েছে' }, { status: 400 });
    }

    // 4. Server-side product price & inventory verification
    let verifiedSubtotal = 0;
    const verifiedItems: Array<{
      productId: number;
      variantId?: number | null;
      productName: string;
      variantDetails: string;
      sku: string;
      unitPrice: number;
      quantity: number;
      totalPrice: number;
      imageUrl: string;
      currentStock: number;
    }> = [];

    for (const item of data.items) {
      const product = await queryOne<any>(
        "SELECT id, name_en, name_bn, sku, regular_price, sale_price, stock_quantity, main_image, product_type, status FROM products WHERE id = ? AND status = 'published'",
        [item.productId]
      );

      if (!product) {
        return NextResponse.json(
          { success: false, error: 'নির্বাচিত প্রোডাক্টটি বর্তমানে বিদ্যমান নেই' },
          { status: 400 }
        );
      }

      let unitPrice = Number(product.sale_price || product.regular_price);
      let sku = product.sku;
      let variantDetails = '';
      let imageUrl = product.main_image;
      let currentStock = Number(product.stock_quantity);

      if (item.variantId) {
        const variant = await queryOne<any>(
          `SELECT pv.*, s.name as size_name, c.name_en as color_name_en 
           FROM product_variants pv 
           LEFT JOIN sizes s ON pv.size_id = s.id 
           LEFT JOIN colors c ON pv.color_id = c.id 
           WHERE pv.id = ? AND pv.product_id = ? AND pv.is_enabled = 1`,
          [item.variantId, product.id]
        );

        if (!variant) {
          return NextResponse.json(
            { success: false, error: `${product.name_en}-এর নির্বাচিত ভ্যারিয়েন্টটি পাওয়া যায়নি` },
            { status: 400 }
          );
        }

        unitPrice = Number(variant.sale_price || variant.regular_price);
        sku = variant.sku;
        variantDetails = `Size: ${variant.size_name || 'N/A'}, Color: ${variant.color_name_en || 'N/A'}`;
        if (variant.image_url) imageUrl = variant.image_url;
        currentStock = Number(variant.stock_quantity);
      }

      if (currentStock < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `দুঃখিত, "${product.name_en}" পর্যাপ্ত স্টকে নেই। অবশিষ্ট স্টক: ${currentStock}`,
          },
          { status: 400 }
        );
      }

      const itemTotal = unitPrice * item.quantity;
      verifiedSubtotal += itemTotal;

      verifiedItems.push({
        productId: product.id,
        variantId: item.variantId || null,
        productName: product.name_en,
        variantDetails,
        sku,
        unitPrice,
        quantity: item.quantity,
        totalPrice: itemTotal,
        imageUrl,
        currentStock,
      });
    }

    // 5. Calculate Server-Side Delivery Fee
    const deliveryCalc = await calculateDeliveryCharge(district.id, verifiedSubtotal);
    const deliveryCharge = deliveryCalc.deliveryCharge;

    // 6. Optional Coupon Calculation
    let discountAmount = 0;
    let appliedCoupon: string | undefined = undefined;

    if (data.couponCode) {
      const coupon = await queryOne<any>(
        'SELECT * FROM coupons WHERE code = ? AND is_active = 1',
        [data.couponCode.trim().toUpperCase()]
      );

      if (coupon && verifiedSubtotal >= Number(coupon.min_order_value || 0)) {
        if (coupon.discount_type === 'percent') {
          discountAmount = (verifiedSubtotal * Number(coupon.discount_value)) / 100;
          if (coupon.max_discount && discountAmount > Number(coupon.max_discount)) {
            discountAmount = Number(coupon.max_discount);
          }
        } else {
          discountAmount = Number(coupon.discount_value);
        }
        appliedCoupon = coupon.code;
      }
    }

    const totalAmount = Math.max(0, verifiedSubtotal + deliveryCharge - discountAmount);

    // 7. Generate Non-Sequential Public Reference & Order Number
    const timestamp = Date.now().toString().slice(-4);
    const randomHex = Math.floor(100000 + Math.random() * 900000);
    const publicReference = `ROX-${timestamp}-${randomHex}`;
    const orderNumber = `ORD-${Date.now()}`;

    // 8. Execute Database Transaction for Order, Items & Inventory Movement
    const orderResult = await withTransaction(async (tx) => {
      // A. Create or update customer profile
      let customer = await tx.queryOne<{ id: number; total_orders: number; total_spend: number }>(
        'SELECT id, total_orders, total_spend FROM customers WHERE phone = ?',
        [normalizedPhone]
      );

      let customerId: number;
      if (!customer) {
        const newCust = await tx.execute(
          `INSERT INTO customers (phone, name, delivery_address, total_orders, total_spend, marketing_consent)
           VALUES (?, ?, ?, 1, ?, ?)`,
          [
            normalizedPhone,
            data.customerName.trim(),
            data.deliveryAddress.trim(),
            totalAmount,
            data.marketingConsent ? 1 : 0,
          ]
        );
        customerId = newCust.lastInsertId;
      } else {
        customerId = customer.id;
        await tx.execute(
          `UPDATE customers 
           SET total_orders = total_orders + 1,
               total_spend = total_spend + ?,
               name = ?,
               delivery_address = ?,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [totalAmount, data.customerName.trim(), data.deliveryAddress.trim(), customerId]
        );
      }

      // Check risk level (e.g. repeated cancellations in past)
      const pastCancelled = await tx.queryOne<{ count: number }>(
        "SELECT COUNT(*) as count FROM orders WHERE customer_phone = ? AND fulfillment_status = 'cancelled'",
        [normalizedPhone]
      );
      const riskLevel = Number(pastCancelled?.count || 0) >= 2 ? 'high' : 'low';

      // B. Insert Order
      const newOrder = await tx.execute(
        `INSERT INTO orders (
          order_number, public_reference, customer_id, customer_name, customer_phone,
          district_id, district_name, delivery_address, order_note,
          payment_method, payment_status, fulfillment_status, risk_level,
          subtotal, delivery_charge, discount_amount, total_amount, coupon_code,
          checkout_session_id
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          'COD', 'pending', 'pending', ?,
          ?, ?, ?, ?, ?,
          ?
        )`,
        [
          orderNumber,
          publicReference,
          customerId,
          data.customerName.trim(),
          normalizedPhone,
          district.id,
          district.name_en,
          data.deliveryAddress.trim(),
          data.orderNote || null,
          riskLevel,
          verifiedSubtotal,
          deliveryCharge,
          discountAmount,
          totalAmount,
          appliedCoupon || null,
          data.checkoutSessionId || null,
        ]
      );

      const orderId = newOrder.lastInsertId;

      // C. Insert Order Line Items & Decrement Inventory
      for (const item of verifiedItems) {
        await tx.execute(
          `INSERT INTO order_items (
            order_id, product_id, variant_id, product_name, variant_details,
            sku, unit_price, quantity, total_price, image_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.productId,
            item.variantId,
            item.productName,
            item.variantDetails,
            item.sku,
            item.unitPrice,
            item.quantity,
            item.totalPrice,
            item.imageUrl,
          ]
        );

        // Inventory deduction
        if (item.variantId) {
          const newVarStock = Math.max(0, item.currentStock - item.quantity);
          await tx.execute(
            'UPDATE product_variants SET stock_quantity = ? WHERE id = ?',
            [newVarStock, item.variantId]
          );
          // Also update base product stock
          await tx.execute(
            'UPDATE products SET stock_quantity = MAX(0, stock_quantity - ?) WHERE id = ?',
            [item.quantity, item.productId]
          );
        } else {
          const newProdStock = Math.max(0, item.currentStock - item.quantity);
          await tx.execute(
            'UPDATE products SET stock_quantity = ? WHERE id = ?',
            [newProdStock, item.productId]
          );
        }

        // Log movement
        await tx.execute(
          `INSERT INTO inventory_movements (
            product_id, variant_id, change_quantity, new_quantity, reason, reference_order_id, created_by
          ) VALUES (?, ?, ?, ?, 'order_placement', ?, 'checkout_system')`,
          [
            item.productId,
            item.variantId,
            -item.quantity,
            Math.max(0, item.currentStock - item.quantity),
            orderId,
          ]
        );
      }

      // D. Link and convert checkout session if provided
      if (data.checkoutSessionId) {
        await tx.execute(
          `UPDATE checkout_sessions 
           SET status = 'converted',
               checkout_stage = 'order_placed',
               order_id = ?
           WHERE session_token = ?`,
          [orderId, data.checkoutSessionId]
        );
      }

      return { orderId, orderNumber, publicReference };
    });

    return NextResponse.json({
      success: true,
      orderNumber: orderResult.orderNumber,
      publicReference: orderResult.publicReference,
      totalAmount,
      deliveryCharge,
      message: 'আপনার অর্ডারটি গ্রহণ করা হয়েছে। আমাদের প্রতিনিধি প্রয়োজনে আপনার সঙ্গে যোগাযোগ করবেন। ধন্যবাদ।',
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'অর্ডার প্রক্রিয়াকরণে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
      },
      { status: 500 }
    );
  }
}
