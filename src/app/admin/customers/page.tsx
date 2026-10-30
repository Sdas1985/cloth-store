import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Users, Phone, ShieldAlert, CheckCircle2, ShoppingBag } from 'lucide-react';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import { Customer } from '@/lib/types';

export const revalidate = 0;

export default async function AdminCustomersPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    redirect('/admin/login');
  }

  const customers = await query<Customer>(`
    SELECT * FROM customers 
    ORDER BY total_spend DESC 
    LIMIT 100
  `);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E7E5E4] flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917]">
            Customer Management (গ্রাহক তালিকা)
          </h1>
          <p className="text-xs sm:text-sm text-[#57534E] mt-0.5">
            Customer profiles, lifetime orders, spending, and fraud review status
          </p>
        </div>

        <div className="text-xs font-semibold bg-white border px-3 py-1.5 rounded-lg">
          Total Customers: <strong>{customers.length}</strong>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E7E5E4] shadow-xs overflow-hidden">
        {customers.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#78716C]">
            বর্তমানে কোনো গ্রাহক রেকর্ড নেই।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF9F5] border-b border-[#E7E5E4] text-[#1C1917]">
                  <th className="p-3.5 font-bold">Customer Name</th>
                  <th className="p-3.5 font-bold">Mobile Phone</th>
                  <th className="p-3.5 font-bold">Saved Address</th>
                  <th className="p-3.5 font-bold">Total Orders</th>
                  <th className="p-3.5 font-bold">Completed</th>
                  <th className="p-3.5 font-bold">Cancelled</th>
                  <th className="p-3.5 font-bold">Lifetime Value (LTV)</th>
                  <th className="p-3.5 font-bold">Fraud Status</th>
                  <th className="p-3.5 font-bold">Consent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4]">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAF9F5]">
                    <td className="p-3.5 font-bold text-[#1C1917]">{c.name}</td>
                    <td className="p-3.5 font-mono text-[#57534E]">{c.phone}</td>
                    <td className="p-3.5 text-[#57534E] max-w-xs truncate">{c.delivery_address || 'N/A'}</td>
                    <td className="p-3.5 font-bold">{c.total_orders}</td>
                    <td className="p-3.5 text-[#15803D] font-semibold">{c.completed_orders}</td>
                    <td className="p-3.5 text-[#B91C1C] font-semibold">{c.cancelled_orders}</td>
                    <td className="p-3.5 font-bold text-[#631322]">
                      ৳{Number(c.total_spend).toLocaleString()}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.fraud_status === 'blocked'
                            ? 'bg-[#FEF2F2] text-[#B91C1C]'
                            : c.fraud_status === 'suspicious'
                            ? 'bg-[#FFFBEB] text-[#B45309]'
                            : 'bg-[#F0FDF4] text-[#15803D]'
                        }`}
                      >
                        {c.fraud_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5 text-[11px] text-[#78716C]">
                      {c.marketing_consent ? 'Subscribed' : 'Opt-out'}
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
