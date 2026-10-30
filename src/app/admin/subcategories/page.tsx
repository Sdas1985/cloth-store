import React from 'react';
import { redirect } from 'next/navigation';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import { Subcategory } from '@/lib/types';

export const revalidate = 0;

export default async function AdminSubcategoriesPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    redirect('/admin/login');
  }

  const subcategories = await query<any>(`
    SELECT 
      sub.*,
      c.name_en as parent_category_name,
      (SELECT COUNT(*) FROM products WHERE subcategory_id = sub.id) as product_count
    FROM subcategories sub
    JOIN categories c ON sub.category_id = c.id
    ORDER BY sub.sort_order ASC
  `);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E7E5E4]">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917]">
          Subcategories (সাব-ক্যাটাগরি সমূহ)
        </h1>
        <p className="text-xs sm:text-sm text-[#57534E] mt-0.5">
          Nested catalogue classification for Menswear and Womenswear
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[#E7E5E4] shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#FAF9F5] border-b border-[#E7E5E4] text-[#1C1917]">
              <th className="p-3.5 font-bold">Subcategory Name</th>
              <th className="p-3.5 font-bold">Parent Category</th>
              <th className="p-3.5 font-bold">Slug</th>
              <th className="p-3.5 font-bold">Linked Products</th>
              <th className="p-3.5 font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7E5E4]">
            {subcategories.map((s) => (
              <tr key={s.id} className="hover:bg-[#FAF9F5]">
                <td className="p-3.5">
                  <div className="font-semibold text-[#1C1917]">{s.name_en}</div>
                  <div className="text-[11px] text-[#78716C] font-bengali">{s.name_bn}</div>
                </td>
                <td className="p-3.5 font-medium text-[#631322]">{s.parent_category_name}</td>
                <td className="p-3.5 font-mono text-[#78716C]">{s.slug}</td>
                <td className="p-3.5 font-bold">{s.product_count} items</td>
                <td className="p-3.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-[#F0FDF4] text-[#15803D] rounded-full">
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
