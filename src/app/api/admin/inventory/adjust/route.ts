import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { execute, queryOne, withTransaction } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { productId, variantId, newQuantity, reason } = await req.json();

    if (!productId || newQuantity === undefined || !reason) {
      return NextResponse.json({ error: 'Missing required adjustment fields' }, { status: 400 });
    }

    await withTransaction(async (tx) => {
      if (variantId) {
        const currentVariant = await tx.queryOne<any>(
          'SELECT stock_quantity FROM product_variants WHERE id = ?',
          [variantId]
        );
        const oldQty = Number(currentVariant?.stock_quantity || 0);
        const changeQty = Number(newQuantity) - oldQty;

        await tx.execute(
          'UPDATE product_variants SET stock_quantity = ? WHERE id = ?',
          [Number(newQuantity), variantId]
        );

        // Update parent product stock
        await tx.execute(
          'UPDATE products SET stock_quantity = (SELECT COALESCE(SUM(stock_quantity), 0) FROM product_variants WHERE product_id = ?) WHERE id = ?',
          [productId, productId]
        );

        await tx.execute(
          `INSERT INTO inventory_movements (product_id, variant_id, change_quantity, new_quantity, reason, created_by)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [productId, variantId, changeQty, Number(newQuantity), reason, admin.name]
        );
      } else {
        const currentProd = await tx.queryOne<any>(
          'SELECT stock_quantity FROM products WHERE id = ?',
          [productId]
        );
        const oldQty = Number(currentProd?.stock_quantity || 0);
        const changeQty = Number(newQuantity) - oldQty;

        await tx.execute(
          'UPDATE products SET stock_quantity = ? WHERE id = ?',
          [Number(newQuantity), productId]
        );

        await tx.execute(
          `INSERT INTO inventory_movements (product_id, variant_id, change_quantity, new_quantity, reason, created_by)
           VALUES (?, NULL, ?, ?, ?, ?)`,
          [productId, changeQty, Number(newQuantity), reason, admin.name]
        );
      }

      await tx.execute(
        `INSERT INTO admin_audit_logs (admin_user_id, admin_name, action, target_type, target_id, details)
         VALUES (?, ?, 'adjust_inventory', 'inventory', ?, ?)`,
        [admin.userId, admin.name, String(productId), `Adjusted stock to ${newQuantity}. Reason: ${reason}`]
      );
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Inventory adjust error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
