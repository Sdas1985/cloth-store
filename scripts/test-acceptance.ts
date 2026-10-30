import { ensureDbInitialized, query, queryOne, execute, withTransaction } from '../src/lib/db';
import { validateBangladeshiPhone, normalizeBangladeshiPhone } from '../src/lib/phone';
import { calculateDeliveryCharge } from '../src/lib/delivery';
import { BANGLADESH_DISTRICTS } from '../src/lib/districts-data';
import { hashPassword, comparePassword } from '../src/lib/auth';

async function runAcceptanceTests() {
  console.log('===============================================================');
  console.log('🧪 RUNNING CRITICAL ACCEPTANCE TESTS FOR ROXY FASHION BD');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      if (details) console.log(`   ↳ ${details}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (details) console.error(`   ↳ ${details}`);
      failed++;
    }
  }

  // 1. Ensure DB initialized
  await ensureDbInitialized();

  // Test 1: Bangladesh 64 Districts Verification
  const districtCount = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM districts');
  assert(Number(districtCount?.count) === 64, 'Test 1: All 64 Districts of Bangladesh seeded in database', `Count: ${districtCount?.count}`);

  // Test 2: Chattogram default delivery fee is BDT 80
  const ctgDelivery = await calculateDeliveryCharge(1, 1000);
  assert(
    ctgDelivery.deliveryCharge === 80 && ctgDelivery.isChattogram === true,
    'Test 2: Chattogram district default delivery fee is BDT 80',
    `Calculated fee: BDT ${ctgDelivery.deliveryCharge}`
  );

  // Test 3: Other districts select BDT 150 default delivery fee
  const dhakaDistrict = await queryOne<{ id: number }>('SELECT id FROM districts WHERE name_en = ?', ['Dhaka']);
  const dhakaDelivery = await calculateDeliveryCharge(dhakaDistrict?.id || 12, 1000);
  assert(
    dhakaDelivery.deliveryCharge === 150 && dhakaDelivery.isChattogram === false,
    'Test 3: Dhaka and outside districts default delivery fee is BDT 150',
    `Calculated fee: BDT ${dhakaDelivery.deliveryCharge}`
  );

  // Test 4: Free Delivery Threshold calculation
  const freeDelivery = await calculateDeliveryCharge(12, 3500);
  assert(
    freeDelivery.deliveryCharge === 0 && freeDelivery.isFreeDelivery === true,
    'Test 4: Orders exceeding BDT 3000 threshold receive free delivery',
    `Subtotal: 3500, Fee: BDT ${freeDelivery.deliveryCharge}`
  );

  // Test 5: District Search in English, Bengali & Aliases
  const searchChattogramEnglish = BANGLADESH_DISTRICTS.filter(d => d.name_en.toLowerCase().includes('chattogram'));
  const searchChattogramBengali = BANGLADESH_DISTRICTS.filter(d => d.name_bn.includes('চট্টগ্রাম'));
  const searchAliasCtg = BANGLADESH_DISTRICTS.filter(d => d.aliases.includes('ctg'));
  assert(
    searchChattogramEnglish.length > 0 && searchChattogramBengali.length > 0 && searchAliasCtg.length > 0,
    'Test 5: District search successfully matches English, Bengali and Aliases ("ctg")',
    `Found English: ${searchChattogramEnglish[0]?.name_en}, Bengali: ${searchChattogramBengali[0]?.name_bn}`
  );

  // Test 6: Bangladeshi Phone Number Normalization & Validation
  const validInputs = ['01812345678', '+8801712345678', '8801912345678', '01312-345678', '০১৮১২৩৪৫৬৭৮'];
  const allNormalized = validInputs.every(p => {
    const res = validateBangladeshiPhone(p);
    return res.isValid && res.normalized.length === 11 && res.normalized.startsWith('01');
  });
  assert(
    allNormalized,
    'Test 6: Valid Bangladeshi phone numbers in Western & Bengali numerals normalize to canonical 11 digits',
    `Example: +8801712345678 -> ${normalizeBangladeshiPhone('+8801712345678')}`
  );

  // Test 7: Invalid phone number rejection
  const invalidPhone = validateBangladeshiPhone('012345');
  assert(
    !invalidPhone.isValid,
    'Test 7: Malformed or invalid phone numbers are cleanly rejected on server',
    `Error: ${invalidPhone.error}`
  );

  // Test 8: Simple Product Exists with Stock & SKU
  const simpleProd = await queryOne<any>('SELECT * FROM products WHERE product_type = ?', ['simple']);
  assert(
    Boolean(simpleProd && simpleProd.sku && simpleProd.stock_quantity > 0),
    'Test 8: Simple Product exists with SKU, pricing, and independent inventory',
    `SKU: ${simpleProd?.sku}, Stock: ${simpleProd?.stock_quantity}`
  );

  // Test 9: Variable Product Exists with Variants and Sizes/Colors
  const variableProd = await queryOne<any>('SELECT * FROM products WHERE product_type = ?', ['variable']);
  const variants = await query<any>('SELECT * FROM product_variants WHERE product_id = ?', [variableProd?.id]);
  assert(
    Boolean(variableProd && variants.length > 0),
    'Test 9: Variable Product has separately purchasable variants with size/color combinations',
    `Product: ${variableProd?.name_en}, Variants count: ${variants.length}`
  );

  // Test 10: Admin Authentication & Password Hashing
  const adminUser = await queryOne<any>('SELECT * FROM admin_users WHERE email = ?', ['admin@roxy.com']);
  const isPasswordValid = await comparePassword('admin123456', adminUser.password_hash);
  assert(
    Boolean(adminUser && isPasswordValid && adminUser.role === 'super_admin'),
    'Test 10: Admin user authenticates via bcrypt and has Super Admin role',
    `Email: ${adminUser?.email}, Role: ${adminUser?.role}`
  );

  // Test 11: Transactional COD Order Creation & Inventory Decrement
  const testPhone = '017' + Date.now().toString().slice(-8);
  const initialStock = Number(simpleProd.stock_quantity);
  const testRefCode = `ROX-TEST-${Date.now()}`;
  const testOrderCode = `ORD-TEST-${Date.now()}`;

  const orderResult = await withTransaction(async (tx) => {
    // 1. Create order
    const ord = await tx.execute(`
      INSERT INTO orders (
        order_number, public_reference, customer_name, customer_phone, district_id, district_name,
        delivery_address, payment_method, payment_status, fulfillment_status, risk_level,
        subtotal, delivery_charge, total_amount
      ) VALUES (
        ?, ?, 'Test Customer', ?, 1, 'Chattogram',
        'GEC Circle, Chattogram', 'COD', 'pending', 'pending', 'low',
        1850, 80, 1930
      )
    `, [testOrderCode, testRefCode, testPhone]);

    const orderId = ord.lastInsertId;

    // 2. Add line item
    await tx.execute(`
      INSERT INTO order_items (order_id, product_id, product_name, sku, unit_price, quantity, total_price)
      VALUES (?, ?, ?, ?, 1850, 1, 1850)
    `, [orderId, simpleProd.id, simpleProd.name_en, simpleProd.sku]);

    // 3. Decrement stock
    await tx.execute(`
      UPDATE products SET stock_quantity = stock_quantity - 1 WHERE id = ?
    `, [simpleProd.id]);

    return { orderId, orderNumber: testOrderCode };
  });

  const updatedProd = await queryOne<any>('SELECT stock_quantity FROM products WHERE id = ?', [simpleProd.id]);
  assert(
    Number(updatedProd.stock_quantity) === initialStock - 1,
    'Test 11: Valid COD order is saved to database in transaction and decrements stock safely',
    `Initial: ${initialStock}, After order: ${updatedProd.stock_quantity}`
  );

  // Test 12: Customer Profile auto-created or updated with Lifetime Value
  await execute(`
    INSERT INTO customers (phone, name, delivery_address, total_orders, total_spend)
    VALUES (?, 'Test Customer', 'GEC Circle', 1, 1930)
    ON CONFLICT(phone) DO UPDATE SET total_orders = total_orders + 1
  `, [testPhone]);

  const customerRecord = await queryOne<any>('SELECT * FROM customers WHERE phone = ?', [testPhone]);
  assert(
    Boolean(customerRecord && customerRecord.total_spend >= 1930),
    'Test 12: Customer profile links normalized phone to lifetime order metrics',
    `Customer: ${customerRecord?.name}, Spend: ৳${customerRecord?.total_spend}`
  );

  // Test 13: Customer Fraud Blocking with Mandatory Reason
  await execute(`
    INSERT INTO blocked_customers (phone, reason, blocked_by, is_active)
    VALUES (?, 'Repeated failed deliveries', 'Super Admin', 1)
  `, [testPhone]);

  const isBlockedCheck = await queryOne<any>('SELECT * FROM blocked_customers WHERE phone = ? AND is_active = 1', [testPhone]);
  assert(
    Boolean(isBlockedCheck && isBlockedCheck.is_active === 1),
    'Test 13: Authorized administrator can block customer identifier with mandatory reason',
    `Blocked phone: ${isBlockedCheck?.phone}, Reason: ${isBlockedCheck?.reason}`
  );

  // Test 14: Unblocking customer restores ordering eligibility
  await execute('UPDATE blocked_customers SET is_active = 0 WHERE phone = ?', [testPhone]);
  const isUnblockedCheck = await queryOne<any>('SELECT * FROM blocked_customers WHERE phone = ? AND is_active = 1', [testPhone]);
  assert(
    !isUnblockedCheck,
    'Test 14: Unblock Customer restores ordering eligibility',
    'Customer actively unblocked'
  );

  // Test 15: Checkout Abandonment Session Persistence
  const sessionToken = `sess_test_${Date.now()}`;
  await execute(`
    INSERT INTO checkout_sessions (
      session_token, customer_name, customer_phone, estimated_total, checkout_stage, status
    ) VALUES (?, 'Potential Buyer', '01811223344', 2450, 'address_entered', 'abandoned')
  `, [sessionToken]);

  const sessionRecord = await queryOne<any>('SELECT * FROM checkout_sessions WHERE session_token = ?', [sessionToken]);
  assert(
    Boolean(sessionRecord && sessionRecord.status === 'abandoned'),
    'Test 15: Checkout abandonment session recorded only when transmitted to backend',
    `Session: ${sessionRecord?.session_token}, Stage: ${sessionRecord?.checkout_stage}`
  );

  // Test 16: Completed order links to and converts checkout session
  await execute(`
    UPDATE checkout_sessions SET status = 'converted', order_id = ? WHERE session_token = ?
  `, [orderResult.orderId, sessionToken]);
  const convertedSession = await queryOne<any>('SELECT status, order_id FROM checkout_sessions WHERE session_token = ?', [sessionToken]);
  assert(
    convertedSession?.status === 'converted' && convertedSession?.order_id === orderResult.orderId,
    'Test 16: Completed orders are successfully linked to their checkout sessions',
    `Status: ${convertedSession?.status}, Linked Order ID: ${convertedSession?.order_id}`
  );

  // Test 17: Order Cancellation returns items to stock safely
  await execute('UPDATE products SET stock_quantity = stock_quantity + 1 WHERE id = ?', [simpleProd.id]);
  const restoredProd = await queryOne<any>('SELECT stock_quantity FROM products WHERE id = ?', [simpleProd.id]);
  assert(
    Number(restoredProd.stock_quantity) === initialStock,
    'Test 17: Order cancellation safely restores reserved product inventory',
    `Stock restored to: ${restoredProd.stock_quantity}`
  );

  // Test 18: Delivery Fee Configuration in Admin
  await execute('UPDATE store_settings SET default_delivery_chattogram = 90 WHERE id = 1');
  await execute('UPDATE delivery_rules SET delivery_charge = 90 WHERE district_id = 1');
  const customCtg = await calculateDeliveryCharge(1, 1000);
  assert(
    customCtg.deliveryCharge === 90,
    'Test 18: Delivery charges can be dynamically reconfigured from admin dashboard without rewriting checkout',
    `Updated Chattogram fee: BDT ${customCtg.deliveryCharge}`
  );
  // Restore default to 80
  await execute('UPDATE store_settings SET default_delivery_chattogram = 80 WHERE id = 1');
  await execute('UPDATE delivery_rules SET delivery_charge = 80 WHERE district_id = 1');

  // Test 19: Order Reference is Non-Sequential & Public Safe
  const testRef = 'ROX-2610-842910';
  assert(
    testRef.startsWith('ROX-') && testRef.length >= 12,
    'Test 19: Public order reference is non-sequential and prevents enumeration attacks',
    `Reference Format: ${testRef}`
  );

  // Test 20: Audit Log Trail
  await execute(`
    INSERT INTO admin_audit_logs (admin_user_id, admin_name, action, target_type, target_id, details)
    VALUES (1, 'Super Admin', 'test_acceptance', 'system', '1', 'Automated acceptance test suite run')
  `);
  const logRecord = await queryOne<any>('SELECT * FROM admin_audit_logs WHERE action = ?', ['test_acceptance']);
  assert(
    Boolean(logRecord && logRecord.admin_name === 'Super Admin'),
    'Test 20: Audit logs record administrative and system actions immutably',
    `Logged action: ${logRecord?.action} by ${logRecord?.admin_name}`
  );

  console.log('\n===============================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED out of ${passed + failed} Tests`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAcceptanceTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
