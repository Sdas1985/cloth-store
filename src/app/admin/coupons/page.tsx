import React from 'react';
import { redirect } from 'next/navigation';
import { TicketPercent, Plus } from 'lucide-react';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import { Coupon } from '@/lib/types';

export const revalidate = 0;

export default async function AdminCouponsPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    redirect('/admin/login');
  }

  const coupons = await query<Coupon>('SELECT * FROM coupons ORDER BY id DESC');

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E7E5E4] flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917]">
            Coupons & Discounts (কুপন ও ছাড়)
          </h1>
          <p className="text-xs sm:text-sm text-[#57534E] mt-0.5">
            Configure promotional promo codes, percentage or fixed discounts, and minimum order rules
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E7E5E4] shadow-xs overflow-hidden">
        {coupons.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#78716C]">
            বর্তমানে কোনো সক্রিয় কুপন কোড নেই।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF9F5] border-b text-[#1C1917]">
                  <th className="p-3.5 font-bold">Code</th>
                  <th className="p-3.5 font-bold">Type</th>
                  <th className="p-3.5 font-bold">Discount Value</th>
                  <th className="p-3.5 font-bold">Min Order Value</th>
                  <th className="p-3.5 font-bold">Usage Count</th>
                  <th className="p-3.5 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4]">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAF9F5]">
                    <td className="p-3.5 font-mono font-bold text-[#631322]">{c.code}</td>
                    <td className="p-3.5 capitalize">{c.discount_type}</td>
                    <td className="p-3.5 font-bold">
                      {c.discount_type === 'percent' ? `${c.discount_value}%` : `৳${c.discount_value}`}
                    </td>
                    <td className="p-3.5">৳{c.min_order_value}</td>
                    <td className="p-3.5">{c.usage_count} times</td>
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
        )}
      </div>
    </div>
  );
}
