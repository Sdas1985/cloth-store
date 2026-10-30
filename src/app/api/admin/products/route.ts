import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { queryOne, execute, withTransaction } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      nameEn,
      nameBn,
      slug,
      productType,
      shortDescription,
      fullDescription,
      sku,
      regularPrice,
      salePrice,
      costPrice,
      mainImage,
      galleryImages,
      categoryId,
      subcategoryId,
      stockQuantity,
      stockStatus,
      status,
      isFeatured,
      isBestseller,
      isNewArrival,
      seoTitle,
      seoDescription,
      specifications,
      variants,
    } = body;

    if (!nameEn || !nameBn || !sku || !regularPrice || !mainImage) {
      return NextResponse.json(
        { success: false, error: 'আবশ্যকীয় ফিল্ডসমূহ পূরণ করুন (Name, SKU, Price, Main Image required)' },
        { status: 400 }
      );
    }

    const generatedSlug = (slug || nameEn)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check unique slug and SKU
    const existingSku = await queryOne('SELECT id FROM products WHERE sku = ?', [sku.trim()]);
    if (existingSku) {
      return NextResponse.json(
        { success: false, error: `SKU "${sku}" ইতিমধ্যে বিদ্যমান। অন্য SKU দিন।` },
        { status: 400 }
      );
    }

    const productResult = await withTransaction(async (tx) => {
      // 1. Insert Base Product
      const newProd = await tx.execute(
        `INSERT INTO products (
          name_en, name_bn, slug, product_type, short_description, full_description,
          sku, regular_price, sale_price, cost_price, main_image, gallery_images,
          category_id, subcategory_id, stock_quantity, stock_status, status,
          is_featured, is_bestseller, is_new_arrival, seo_title, seo_description,
          specifications
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?
        )`,
        [
          nameEn.trim(),
          nameBn.trim(),
          generatedSlug,
          productType || 'simple',
          shortDescription || null,
          fullDescription || null,
          sku.trim(),
          Number(regularPrice),
          salePrice ? Number(salePrice) : null,
          costPrice ? Number(costPrice) : null,
          mainImage.trim(),
          JSON.stringify(galleryImages || []),
          categoryId ? Number(categoryId) : null,
          subcategoryId ? Number(subcategoryId) : null,
          Number(stockQuantity || 0),
          stockStatus || 'in_stock',
          status || 'published',
          isFeatured ? 1 : 0,
          isBestseller ? 1 : 0,
          isNewArrival ? 1 : 0,
          seoTitle || null,
          seoDescription || null,
          JSON.stringify(specifications || {}),
        ]
      );

      const productId = newProd.lastInsertId;

      // 2. Insert Variants if Variable Product
      if (productType === 'variable' && Array.isArray(variants) && variants.length > 0) {
        let totalVariantStock = 0;
        for (const v of variants) {
          totalVariantStock += Number(v.stockQuantity || 0);
          await tx.execute(
            `INSERT INTO product_variants (
              product_id, size_id, color_id, sku, regular_price, sale_price,
              stock_quantity, image_url, is_enabled
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              productId,
              v.sizeId ? Number(v.sizeId) : null,
              v.colorId ? Number(v.colorId) : null,
              v.sku ? v.sku.trim() : `${sku}-${Math.random().toString(36).substring(2, 6)}`,
              Number(v.regularPrice || regularPrice),
              v.salePrice ? Number(v.salePrice) : null,
              Number(v.stockQuantity || 0),
              v.imageUrl || null,
              v.isEnabled ? 1 : 0,
            ]
          );
        }

        // Synchronize base product stock quantity with sum of variants
        await tx.execute(
          'UPDATE products SET stock_quantity = ? WHERE id = ?',
          [totalVariantStock, productId]
        );
      }

      // Log audit
      await tx.execute(
        `INSERT INTO admin_audit_logs (admin_user_id, admin_name, action, target_type, target_id, details)
         VALUES (?, ?, 'create_product', 'product', ?, ?)`,
        [admin.userId, admin.name, String(productId), `Created product ${nameEn} (${sku})`]
      );

      return { productId, slug: generatedSlug };
    });

    return NextResponse.json({ success: true, product: productResult });
  } catch (err: any) {
    console.error('Product creation error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'প্রোডাক্ট তৈরিতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
