import { Router, Request, Response } from 'express';
import {
  createOrder,
  getOrderByRef,
  getOrdersByPhone,
  calculateDeliveryCharge,
  getDistricts,
  getProductById,
} from '../storeRepo';
import { validateBangladeshiPhone } from '../../src/lib/phone';

const router = Router();

// POST /api/orders - Place a new order
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      customerName,
      customerPhone,
      districtId,
      deliveryAddress,
      orderNote,
      items,
    } = req.body;

    // 1. Validations
    if (!customerName || customerName.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'অনুগ্রহ করে গ্রাহকের পুরো নাম দিন।' });
    }

    const phoneValidation = validateBangladeshiPhone(customerPhone || '');
    if (!phoneValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: phoneValidation.error || 'সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01812345678)',
      });
    }

    if (!deliveryAddress || deliveryAddress.trim().length < 5) {
      return res.status(400).json({ success: false, error: 'বিস্তারিত ডেলিভারি ঠিকানা প্রদান করুন।' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'আপনার শপিং ব্যাগে কোনো প্রোডাক্ট নেই।' });
    }

    // 2. Validate district
    const districts = getDistricts();
    const targetDistrict = districts.find((d: any) => d.id === Number(districtId));
    if (!targetDistrict) {
      return res.status(400).json({ success: false, error: 'সঠিক জেলা নির্বাচন করুন।' });
    }

    // 3. Compute verified subtotal and items from database
    let subtotal = 0;
    const verifiedItems: any[] = [];

    for (const item of items) {
      const product = await getProductById(Number(item.productId));
      if (!product) {
        return res.status(400).json({
          success: false,
          error: `প্রোডাক্টটি খুঁজে পাওয়া যায়নি (ID: ${item.productId})`,
        });
      }

      let unitPrice = product.sale_price || product.regular_price;
      let variantDetails = '';

      if (item.variantId && product.variants) {
        const variant = product.variants.find((v: any) => v.id === Number(item.variantId));
        if (variant) {
          unitPrice = variant.sale_price || variant.regular_price || unitPrice;
          variantDetails = [variant.size_name ? `Size: ${variant.size_name}` : '', variant.color_name_bn ? `রং: ${variant.color_name_bn}` : '']
            .filter(Boolean)
            .join(' | ');
        }
      }

      const qty = Math.max(1, Number(item.quantity) || 1);
      const totalPrice = unitPrice * qty;
      subtotal += totalPrice;

      verifiedItems.push({
        productId: product.id,
        variantId: item.variantId || null,
        productName: product.name_bn || product.name_en,
        variantDetails,
        sku: product.sku,
        unitPrice,
        quantity: qty,
        totalPrice,
        imageUrl: product.main_image,
      });
    }

    // 4. Calculate delivery charge
    const deliveryCharge = calculateDeliveryCharge(targetDistrict.id, subtotal);
    const totalAmount = subtotal + deliveryCharge;

    // 5. Create Order in MongoDB
    const newOrder = await createOrder({
      customerName: customerName.trim(),
      customerPhone: phoneValidation.normalized,
      districtId: targetDistrict.id,
      districtName: targetDistrict.name_bn,
      deliveryAddress: deliveryAddress.trim(),
      orderNote: orderNote ? String(orderNote).trim() : '',
      items: verifiedItems,
      subtotal,
      deliveryCharge,
      totalAmount,
    });

    res.json({
      success: true,
      publicReference: newOrder.public_reference,
      order: newOrder,
    });
  } catch (err: any) {
    console.error('[Order Placement Error]', err);
    res.status(500).json({ success: false, error: 'সার্ভার ত্রুটি: অর্ডার সম্পন্ন করা সম্ভব হয়নি।' });
  }
});

// POST /api/orders/track - Track order by reference or phone
router.post('/track', async (req: Request, res: Response) => {
  try {
    const { reference, phone } = req.body;

    if (reference) {
      const order = await getOrderByRef(reference);
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'এই রেফারেন্স নম্বরে কোনো অর্ডার খুঁজে পাওয়া যায়নি। অনুগ্রহ করে সঠিক নম্বর দিন।',
        });
      }
      return res.json({ success: true, order, items: order.items });
    }

    if (phone) {
      const phoneVal = validateBangladeshiPhone(phone);
      if (!phoneVal.isValid) {
        return res.status(400).json({ success: false, error: 'সঠিক ১১ ডিজিটের ফোন নম্বর দিন।' });
      }
      const orders = await getOrdersByPhone(phoneVal.normalized);
      if (!orders || orders.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'এই মোবাইল নম্বরে কোনো অর্ডার খুঁজে পাওয়া যায়নি।',
        });
      }
      return res.json({ success: true, order: orders[0], allOrders: orders, items: orders[0].items });
    }

    res.status(400).json({ success: false, error: 'অর্ডার রেফারেন্স অথবা মোবাইল নম্বর দিন।' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/orders/:orderRef - Fetch order details by reference
router.get('/:orderRef', async (req: Request, res: Response) => {
  try {
    const ref = Array.isArray(req.params.orderRef) ? req.params.orderRef[0] : req.params.orderRef;
    const order = await getOrderByRef(ref);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, order, items: order.items });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
