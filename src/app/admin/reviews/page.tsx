import React from 'react';
import { redirect } from 'next/navigation';
import { Star, ShieldCheck } from 'lucide-react';
import { getAuthenticatedAdmin } from '@/lib/auth';

export const revalidate = 0;

export default async function AdminReviewsPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    redirect('/admin/login');
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E7E5E4]">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917]">
          Customer Reviews & Verification (রিভিউ ব্যবস্থাপনা)
        </h1>
        <p className="text-xs sm:text-sm text-[#57534E] mt-0.5">
          Genuine verified purchaser review collection policy
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-xs max-w-2xl space-y-3 text-xs">
        <div className="flex items-center gap-2 pb-2 border-b">
          <ShieldCheck className="w-5 h-5 text-[#631322]" />
          <h3 className="font-bold text-sm text-[#1C1917]">Genuine Review System Policy</h3>
        </div>
        <p className="text-[#57534E] leading-relaxed">
          In strict compliance with our platform integrity guidelines, fake or automated testimonials are completely disabled. Reviews can only be submitted after verified parcel delivery by courier partners.
        </p>
        <div className="p-3 bg-[#FAF9F5] border rounded-lg text-[#78716C]">
          Status: Review submission invites are triggered automatically after order fulfillment reaches <strong className="text-[#15803D]">Delivered</strong> status.
        </div>
      </div>
    </div>
  );
}
