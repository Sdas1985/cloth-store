'use client';

import React, { useState } from 'react';
import { Truck, Check, AlertCircle, ShieldCheck } from 'lucide-react';
import { StoreSettings, DeliveryRule } from '@/lib/types';

interface DeliverySettingsClientProps {
  settings: StoreSettings;
  rules: DeliveryRule[];
}

export function DeliverySettingsClient({ settings, rules }: DeliverySettingsClientProps) {
  const [ctgFee, setCtgFee] = useState<number>(settings.default_delivery_chattogram || 80);
  const [nationalFee, setNationalFee] = useState<number>(settings.default_delivery_national || 150);
  const [freeThreshold, setFreeThreshold] = useState<number>(settings.free_delivery_threshold || 3000);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/admin/delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defaultDeliveryChattogram: ctgFee,
          defaultDeliveryNational: nationalFee,
          freeDeliveryThreshold: freeThreshold,
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        alert('সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch (err) {
      alert('সার্ভার ত্রুটি');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-[#E7E5E4]">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917]">
          Delivery Rules & Pricing (ডেলিভারি চার্জ ও নীতিমালা)
        </h1>
        <p className="text-xs sm:text-sm text-[#57534E] mt-0.5">
          Configure default delivery charges, district policies, and free shipping thresholds
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Core Delivery Settings Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b">
            <Truck className="w-5 h-5 text-[#631322]" />
            <h3 className="font-bold text-base text-[#1C1917]">National & District Charges</h3>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg text-xs text-[#15803D] flex items-center gap-2 font-semibold">
              <Check className="w-4 h-4" />
              <span>ডেলিভারি চার্জ সফলভাবে আপডেট করা হয়েছে!</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#1C1917] mb-1">
                Chattogram District Default Delivery Charge (চট্টগ্রাম জেলা) <span className="text-[#B91C1C]">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  value={ctgFee}
                  onChange={(e) => setCtgFee(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#D6D3D1] rounded-lg font-bold text-[#631322]"
                />
                <span className="absolute right-3.5 top-2.5 text-[#78716C]">BDT</span>
              </div>
              <p className="text-[11px] text-[#78716C] mt-1">Default policy: 80 BDT for Chattogram</p>
            </div>

            <div>
              <label className="block font-semibold text-[#1C1917] mb-1">
                Nationwide Delivery Charge (অন্যান্য ৬৩টি জেলা) <span className="text-[#B91C1C]">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  value={nationalFee}
                  onChange={(e) => setNationalFee(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#D6D3D1] rounded-lg font-bold text-[#631322]"
                />
                <span className="absolute right-3.5 top-2.5 text-[#78716C]">BDT</span>
              </div>
              <p className="text-[11px] text-[#78716C] mt-1">Default policy: 150 BDT nationwide</p>
            </div>

            <div>
              <label className="block font-semibold text-[#1C1917] mb-1">
                Free Delivery Order Threshold (ফ্রি ডেলিভারি সীমা) <span className="text-[#B91C1C]">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  value={freeThreshold}
                  onChange={(e) => setFreeThreshold(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#D6D3D1] rounded-lg font-bold text-[#15803D]"
                />
                <span className="absolute right-3.5 top-2.5 text-[#78716C]">BDT</span>
              </div>
              <p className="text-[11px] text-[#78716C] mt-1">
                Orders equal or exceeding this amount automatically receive 0 BDT delivery.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#631322] hover:bg-[#4E0E1A] text-white font-bold rounded-lg text-xs shadow-md transition-colors"
              >
                {loading ? 'সংরক্ষণ হচ্ছে...' : 'Save Delivery Configuration'}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Active Rules */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-[#1C1917] pb-2 border-b">
            Active Priority Rules
          </h3>

          <div className="space-y-3 text-xs">
            {rules.map((r) => (
              <div key={r.id} className="p-3 bg-[#FAF9F5] rounded-xl border border-[#E7E5E4] space-y-1">
                <div className="flex justify-between items-center font-bold text-[#1C1917]">
                  <span>{r.title}</span>
                  <span className="text-[#631322]">৳{r.delivery_charge}</span>
                </div>
                <div className="text-[11px] text-[#78716C]">
                  Zone: {r.zone_name || 'Standard'} • Free on ৳{r.free_delivery_threshold || '3000'}+
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t text-[11px] text-[#78716C] leading-relaxed">
            ⚡ Deterministic Rule Hierarchy: Specific district rule overrides default national policy. Free delivery threshold applies automatically across all matching checkouts.
          </div>
        </div>
      </div>
    </div>
  );
}
