import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Layers, Plus, Trash2, Edit } from 'lucide-react';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import { Category } from '@/lib/types';

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    redirect('/admin/login');
  }

  const categories = await query<any>(`
    SELECT 
      c.*,
      (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count,
      (SELECT COUNT(*) FROM subcategories WHERE category_id = c.id) as subcategory_count
    FROM categories c
    ORDER BY c.sort_order ASC
  `);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E7E5E4] gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917]">
            Category Management (ক্যাটাগরি সমূহ)
          </h1>
          <p className="text-xs sm:text-sm text-[#57534E] mt-0.5">
            Manage storefront collections, slugs, and associated product counts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-xl border border-[#E7E5E4] p-5 shadow-xs flex gap-4 items-start"
          >
            <div className="w-20 h-24 bg-[#FAF9F5] rounded-lg overflow-hidden shrink-0 border border-[#E7E5E4]">
              {cat.image_url ? (
                <img src={cat.image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#78716C]">
                  <Layers className="w-6 h-6" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-[#1C1917]">{cat.name_en}</h3>
                  <h4 className="text-xs text-[#57534E] font-bengali">{cat.name_bn}</h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-[#F0FDF4] text-[#15803D] rounded-full">
                  Active
                </span>
              </div>

              <div className="text-xs text-[#78716C] mt-2 space-y-0.5">
                <div>Slug: <span className="font-mono text-[#631322]">/category/{cat.slug}</span></div>
                <div>Products Linked: <strong>{cat.product_count}</strong> items</div>
                <div>Subcategories: <strong>{cat.subcategory_count}</strong></div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#F5F3EF] flex justify-between items-center text-xs">
                <Link
                  href={`/category/${cat.slug}`}
                  target="_blank"
                  className="text-[#631322] font-semibold hover:underline"
                >
                  View on Website →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
