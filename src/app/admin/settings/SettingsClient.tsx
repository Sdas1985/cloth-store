'use client';

import React, { useState } from 'react';
import { Settings, Check } from 'lucide-react';
import { StoreSettings } from '@/lib/types';

export function SettingsClient({ settings }: { settings: StoreSettings }) {
  const [storeName, setStoreName] = useState(settings.store_name || '');
  const [taglineEn, setTaglineEn] = useState(settings.tagline_en || '');
  const [taglineBn, setTaglineBn] = useState(settings.tagline_bn || '');
  const [phone, setPhone] = useState(settings.phone || '');
  const [email, setEmail] = useState(settings.email || '');
  const [addressEn, setAddressEn] = useState(settings.address_en || '');
  const [addressBn, setAddressBn] = useState(settings.address_bn || '');
  const [facebookUrl, setFacebookUrl] = useState(settings.facebook_url || '');
  const [instagramUrl, setInstagramUrl] = useState(settings.instagram_url || '');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName,
          taglineEn,
          taglineBn,
          phone,
          email,
          addressEn,
          addressBn,
          facebookUrl,
          instagramUrl,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      alert('সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E7E5E4]">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917]">
          Store Settings (দোকান ও ব্র্যান্ড সেটিংস)
        </h1>
        <p className="text-xs sm:text-sm text-[#57534E] mt-0.5">
          Configure business name, hotline numbers, contact emails, and showroom locations
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-xs max-w-2xl space-y-4">
        {saved && (
          <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg text-xs text-[#15803D] flex items-center gap-2 font-semibold">
            <Check className="w-4 h-4" />
            <span>সেটিংস সফলভাবে আপডেট করা হয়েছে!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Store Name (দোকানের নাম)</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full p-2.5 bg-[#FAF9F5] border rounded-lg font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Tagline in English</label>
              <input
                type="text"
                value={taglineEn}
                onChange={(e) => setTaglineEn(e.target.value)}
                className="w-full p-2.5 bg-[#FAF9F5] border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">ট্যাগলাইন বাংলায়</label>
              <input
                type="text"
                value={taglineBn}
                onChange={(e) => setTaglineBn(e.target.value)}
                className="w-full p-2.5 bg-[#FAF9F5] border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Hotline Phone</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-[#FAF9F5] border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Support Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 bg-[#FAF9F5] border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Showroom Address in English</label>
            <input
              type="text"
              value={addressEn}
              onChange={(e) => setAddressEn(e.target.value)}
              className="w-full p-2.5 bg-[#FAF9F5] border rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">শো-রুমের ঠিকানা বাংলায়</label>
            <input
              type="text"
              value={addressBn}
              onChange={(e) => setAddressBn(e.target.value)}
              className="w-full p-2.5 bg-[#FAF9F5] border rounded-lg"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#631322] text-white font-bold rounded-lg text-xs shadow-md"
          >
            {loading ? 'সংরক্ষণ হচ্ছে...' : 'Save Store Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
