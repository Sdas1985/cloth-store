import React from 'react';
import { redirect } from 'next/navigation';
import { Database, Download, ShieldCheck, Server } from 'lucide-react';
import { getAuthenticatedAdmin } from '@/lib/auth';

export const revalidate = 0;

export default async function AdminBackupPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    redirect('/admin/login');
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E7E5E4]">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917]">
          Backup & Data Export Guidance (ব্যাকআপ ও এক্সপোর্ট)
        </h1>
        <p className="text-xs sm:text-sm text-[#57534E] mt-0.5">
          Database resilience, disaster recovery procedures, and SQL migration exports
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Server className="w-5 h-5 text-[#631322]" />
            <h3 className="font-bold text-sm text-[#1C1917]">PostgreSQL Production Migration</h3>
          </div>
          <p className="text-xs text-[#57534E] leading-relaxed">
            The database schema is fully standardized and compatible with Supabase, Neon, AWS RDS, and self-hosted PostgreSQL.
          </p>
          <div className="p-3 bg-[#FAF9F5] rounded-lg border text-xs font-mono space-y-1">
            <div className="text-[#631322] font-bold">Migration File Location:</div>
            <div className="text-[#1C1917]">migrations/001_initial_schema.sql</div>
          </div>
          <p className="text-xs text-[#78716C]">
            To connect to managed Supabase PostgreSQL, simply add your PostgreSQL connection string to the <code className="bg-[#FAF9F5] px-1 py-0.5 border rounded">DATABASE_URL</code> environment variable.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <ShieldCheck className="w-5 h-5 text-[#15803D]" />
            <h3 className="font-bold text-sm text-[#1C1917]">Snapshot Integrity Guarantee</h3>
          </div>
          <p className="text-xs text-[#57534E] leading-relaxed">
            All customer orders store an immutable historical snapshot of the unit price, variant attributes, delivery fee, and quantity so that future catalogue or price modifications never corrupt past financial records.
          </p>
          <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg text-xs text-[#15803D]">
            ✓ Product cascading deletions do not purge order histories.
          </div>
        </div>
      </div>
    </div>
  );
}
