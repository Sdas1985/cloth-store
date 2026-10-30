'use client';

import React, { useState } from 'react';
import { Globe, Check, AlertCircle } from 'lucide-react';
import { StoreSettings } from '@/lib/types';

export function ContentClient({ settings }: { settings: StoreSettings }) {
  const [headlineEn, setHeadlineEn] = useState(settings.banner_headline_en || '');
  const [headlineBn, setHeadlineBn] = useState(settings.banner_headline_bn || '');
  const [subheadlineEn, setSubheadlineEn] = useState(settings.banner_subheadline_en || '');
  const [subheadlineBn, setSubheadlineBn] = useState(settings.banner_subheadline_bn || '');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bannerHeadlineEn: headlineEn,
          bannerHeadlineBn: headlineBn,
          bannerSubheadlineEn: subheadlineEn,
          bannerSubheadlineBn: subheadlineBn,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      alert('ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E7E5E4]">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917]">
          Website Content (হোমপেজ ও কনটেন্ট)
        </h1>
        <p className="text-xs sm:text-sm text-[#57534E] mt-0.5">
          Edit promotional headlines, Bengali banners, and marketing text
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-xs max-w-2xl space-y-4">
        {saved && (
          <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg text-xs text-[#15803D] flex items-center gap-2 font-semibold">
            <Check className="w-4 h-4" />
            <span>কনটেন্ট সফলভাবে সেভ করা হয়েছে!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Hero Promotional Headline in English</label>
            <input
              type="text"
              value={headlineEn}
              onChange={(e) => setHeadlineEn(e.target.value)}
              className="w-full p-2.5 bg-[#FAF9F5] border rounded-lg text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">হিরো হেডলাইন বাংলায় (Bengali Headline)</label>
            <input
              type="text"
              value={headlineBn}
              onChange={(e) => setHeadlineBn(e.target.value)}
              className="w-full p-2.5 bg-[#FAF9F5] border rounded-lg text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Hero Subheadline in English</label>
            <input
              type="text"
              value={subheadlineEn}
              onChange={(e) => setSubheadlineEn(e.target.value)}
              className="w-full p-2.5 bg-[#FAF9F5] border rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">সাবহেডলাইন বাংলায় (Bengali Subheadline)</label>
            <textarea
              rows={3}
              value={subheadlineBn}
              onChange={(e) => setSubheadlineBn(e.target.value)}
              className="w-full p-2.5 bg-[#FAF9F5] border rounded-lg text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#631322] text-white font-bold rounded-lg text-xs shadow-md"
          >
            {loading ? 'সংরক্ষণ হচ্ছে...' : 'Save Website Content'}
          </button>
        </form>
      </div>
    </div>
  );
}
