import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus, Package, Layers, ExternalLink, Edit } from 'lucide-react';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import { Product } from '@/lib/types';

export const revalidate = 0;

export default async function AdminProductsPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    redirect('/admin/login');
  }

  const products = await query<any>(`
    SELECT 
      p.*,
      cat.name_en as category_name_en,
      cat.name_bn as category_name_bn,
      (SELECT COUNT(*) FROM product_variants WHERE product_id = p.id) as variant_count
    FROM products p
    LEFT JOIN categories cat ON p.category_id = cat.id
    ORDER BY p.id DESC
  `);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E7E5E4] gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917]">
            Product Catalogue (প্রোডাক্ট তালিকা)
          </h1>
          <p className="text-xs sm:text-sm text-[#57534E] mt-0.5">
            Manage Simple and Variable collections, pricing, SKU codes, and variant stocks
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#631322] hover:bg-[#4E0E1A] text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Product List Table */}
      <div className="bg-white rounded-xl border border-[#E7E5E4] shadow-xs overflow-hidden">
        {products.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#78716C]">
            বর্তমানে কোনো প্রোডাক্ট নেই। উপরে "+ Add New Product" বাটনে ক্লিক করে যোগ করুন।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF9F5] border-b border-[#E7E5E4] text-[#1C1917]">
                  <th className="p-3.5 font-bold">Image</th>
                  <th className="p-3.5 font-bold">Product Name</th>
                  <th className="p-3.5 font-bold">SKU</th>
                  <th className="p-3.5 font-bold">Type</th>
                  <th className="p-3.5 font-bold">Category</th>
                  <th className="p-3.5 font-bold">Price</th>
                  <th className="p-3.5 font-bold">Stock</th>
                  <th className="p-3.5 font-bold">Status</th>
                  <th className="p-3.5 font-bold text-right">View / Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4]">
                {products.map((p) => {
                  const isOutOfStock = Number(p.stock_quantity) <= 0;
                  const isVariable = p.product_type === 'variable';

                  return (
                    <tr key={p.id} className="hover:bg-[#FAF9F5] transition-colors">
                      <td className="p-3.5">
                        <img
                          src={p.main_image}
                          alt=""
                          className="w-10 h-12 object-cover rounded-md border"
                        />
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-[#1C1917] max-w-xs">{p.name_en}</div>
                        <div className="text-[11px] text-[#78716C] font-bengali">{p.name_bn}</div>
                      </td>
                      <td className="p-3.5 font-mono text-[#57534E] font-medium">{p.sku}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isVariable ? 'bg-[#F7EAEF] text-[#631322]' : 'bg-[#F5F3EF] text-[#57534E]'
                          }`}
                        >
                          {isVariable ? `Variable (${p.variant_count} variants)` : 'Simple'}
                        </span>
                      </td>
                      <td className="p-3.5 text-[#57534E]">{p.category_name_en || 'General'}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-[#631322]">
                          ৳{Number(p.sale_price || p.regular_price).toLocaleString()}
                        </div>
                        {p.sale_price && (
                          <div className="text-[10px] text-[#A8A29E] line-through">
                            ৳{Number(p.regular_price).toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`font-semibold ${
                            isOutOfStock ? 'text-[#B91C1C]' : 'text-[#15803D]'
                          }`}
                        >
                          {p.stock_quantity} pcs
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#15803D]">
                          {p.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <Link
                          href={`/product/${p.slug}`}
                          target="_blank"
                          className="p-1.5 inline-flex items-center justify-center rounded hover:bg-[#E7E5E4] text-[#57534E]"
                          title="View on Storefront"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
