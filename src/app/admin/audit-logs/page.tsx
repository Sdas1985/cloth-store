import React from 'react';
import { redirect } from 'next/navigation';
import { History, ShieldCheck } from 'lucide-react';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import { AdminAuditLog } from '@/lib/types';

export const revalidate = 0;

export default async function AdminAuditLogsPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    redirect('/admin/login');
  }

  const logs = await query<AdminAuditLog>(
    'SELECT * FROM admin_audit_logs ORDER BY id DESC LIMIT 100'
  );

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E7E5E4] flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917]">
            Activity & Audit Logs (অডিট ও অ্যাক্টিভিটি লগ)
          </h1>
          <p className="text-xs sm:text-sm text-[#57534E] mt-0.5">
            Immutable server audit trail of staff logins, order updates, stock adjustments, and customer blocks
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E7E5E4] shadow-xs overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#78716C]">
            বর্তমানে কোনো অডিট রেকর্ড নেই।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF9F5] border-b text-[#1C1917]">
                  <th className="p-3.5 font-bold">Timestamp</th>
                  <th className="p-3.5 font-bold">Admin User</th>
                  <th className="p-3.5 font-bold">Action</th>
                  <th className="p-3.5 font-bold">Target</th>
                  <th className="p-3.5 font-bold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4]">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-[#FAF9F5]">
                    <td className="p-3.5 text-[#78716C] whitespace-nowrap">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                    <td className="p-3.5 font-bold text-[#1C1917]">{l.admin_name || 'System'}</td>
                    <td className="p-3.5">
                      <span className="font-mono text-[11px] font-bold uppercase text-[#631322]">
                        {l.action}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#57534E] font-medium">{l.target_type}</td>
                    <td className="p-3.5 text-[#1C1917] max-w-md">{l.details}</td>
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
