import React from 'react';
import { redirect } from 'next/navigation';
import { Search, Globe, Check } from 'lucide-react';
import { getAuthenticatedAdmin } from '@/lib/auth';

export const revalidate = 0;

export default async function AdminSeoPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    redirect('/admin/login');
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E7E5E4]">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917]">
          SEO & Meta Settings (সার্চ ইঞ্জিন অপটিমাইজেশন)
        </h1>
        <p className="text-xs sm:text-sm text-[#57534E] mt-0.5">
          Automated JSON-LD schemas, Google SERP snippets, canonical URLs, and Core Web Vitals
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-xs max-w-2xl space-y-4 text-xs">
        <h3 className="font-bold text-sm text-[#1C1917] pb-2 border-b">Active SEO Features</h3>
        <ul className="space-y-2 text-[#57534E]">
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#15803D]" />
            <span>Product Rich Snippets (Schema.org JSON-LD with live price and stock status)</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#15803D]" />
            <span>OpenGraph cards for Facebook and WhatsApp sharing</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#15803D]" />
            <span>Dynamic Bengali & English meta title tags and descriptions</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#15803D]" />
            <span>Robots.txt and XML Sitemap generation</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
