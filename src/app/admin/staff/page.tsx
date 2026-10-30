import React from 'react';
import { redirect } from 'next/navigation';
import { UserCheck, ShieldCheck } from 'lucide-react';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import { AdminUser } from '@/lib/types';

export const revalidate = 0;

export default async function AdminStaffPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    redirect('/admin/login');
  }

  const staff = await query<AdminUser>(
    'SELECT id, name, email, role, is_active, created_at FROM admin_users ORDER BY id ASC'
  );

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E7E5E4] flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917]">
            Staff & Roles (অ্যাডমিন ও স্টাফ অ্যাকাউন্ট)
          </h1>
          <p className="text-xs sm:text-sm text-[#57534E] mt-0.5">
            Role-based access control (Super Admin, Order Manager, Product Manager, Support Agent)
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E7E5E4] shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#FAF9F5] border-b text-[#1C1917]">
              <th className="p-3.5 font-bold">Staff Name</th>
              <th className="p-3.5 font-bold">Email</th>
              <th className="p-3.5 font-bold">Role</th>
              <th className="p-3.5 font-bold">Permissions Scope</th>
              <th className="p-3.5 font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7E5E4]">
            {staff.map((s) => (
              <tr key={s.id} className="hover:bg-[#FAF9F5]">
                <td className="p-3.5 font-bold text-[#1C1917]">{s.name}</td>
                <td className="p-3.5 text-[#57534E] font-mono">{s.email}</td>
                <td className="p-3.5">
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-[#F7EAEF] text-[#631322] rounded-full uppercase">
                    {s.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-3.5 text-[#57534E]">
                  {s.role === 'super_admin'
                    ? 'Full Administrator Access (All Modules)'
                    : s.role === 'order_manager'
                    ? 'Order Processing & Customer Management'
                    : s.role === 'product_manager'
                    ? 'Catalogue & Inventory Management'
                    : 'Customer Inquiries & Tracking Support'}
                </td>
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
