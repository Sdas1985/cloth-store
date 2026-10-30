'use client';

import React, { useState } from 'react';
import { ShieldAlert, UserX, UserCheck, Plus, AlertCircle, Phone } from 'lucide-react';
import { BlockedCustomer } from '@/lib/types';

interface FraudClientProps {
  initialBlocked: BlockedCustomer[];
}

export function FraudClient({ initialBlocked }: FraudClientProps) {
  const [blockedList, setBlockedList] = useState<BlockedCustomer[]>(initialBlocked);
  const [phoneInput, setPhoneInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phoneInput.trim() || !reasonInput.trim()) {
      setError('মোবাইল নম্বর এবং ব্লক করার কারণ উভয়ই আবশ্যক');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/fraud/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInput.trim(), reason: reasonInput.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'ব্লক করতে সমস্যা হয়েছে');
        setLoading(false);
        return;
      }

      setBlockedList([
        {
          id: Date.now(),
          phone: phoneInput.trim(),
          reason: reasonInput.trim(),
          blocked_by: 'Admin',
          is_active: true,
          created_at: new Date().toISOString(),
        },
        ...blockedList,
      ]);
      setPhoneInput('');
      setReasonInput('');
      alert('নম্বরটি সফলভাবে ব্লক করা হয়েছে!');
    } catch (err) {
      setError('সার্ভারে যোগাযোগ করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (phone: string, id: number) => {
    if (!confirm(`আপনি কি ${phone} নম্বরটি আনব্লক করতে চান?`)) return;

    try {
      const res = await fetch('/api/admin/fraud/unblock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      if (res.ok) {
        setBlockedList(blockedList.filter((b) => b.id !== id));
        alert('নম্বরটি আনব্লক করা হয়েছে।');
      }
    } catch (err) {
      alert('আনব্লক করতে সমস্যা হয়েছে');
    }
  };

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-[#E7E5E4]">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917]">
          Blocked Customers / Fraud Review (ব্লকলিস্ট ও ফ্রড রিভিউ)
        </h1>
        <p className="text-xs sm:text-sm text-[#57534E] mt-0.5">
          Phone number based blocklist preventing abusive orders, fake checkouts, and non-delivery fraud
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Blocklist Table */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-[#E7E5E4] shadow-xs overflow-hidden">
          <div className="p-4 bg-[#FAF9F5] border-b flex justify-between items-center text-xs">
            <span className="font-bold text-[#1C1917] flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#B91C1C]" />
              <span>সক্রিয় ব্লক তালিকা (Active Blocklist)</span>
            </span>
            <span className="text-[#78716C] font-semibold">Total: {blockedList.length}</span>
          </div>

          {blockedList.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#78716C]">
              বর্তমানে কোনো ব্লকড নম্বর নেই।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF9F5] border-b text-[#1C1917]">
                    <th className="p-3.5 font-bold">Blocked Phone</th>
                    <th className="p-3.5 font-bold">Mandatory Reason</th>
                    <th className="p-3.5 font-bold">Blocked By</th>
                    <th className="p-3.5 font-bold">Date</th>
                    <th className="p-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E4]">
                  {blockedList.map((b) => (
                    <tr key={b.id} className="hover:bg-[#FAF9F5]">
                      <td className="p-3.5 font-mono font-bold text-[#B91C1C]">{b.phone}</td>
                      <td className="p-3.5 text-[#1C1917] max-w-xs">{b.reason}</td>
                      <td className="p-3.5 text-[#57534E]">{b.blocked_by || 'Admin'}</td>
                      <td className="p-3.5 text-[#78716C]">
                        {new Date(b.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleUnblock(b.phone, b.id)}
                          className="px-3 py-1 bg-[#15803D] hover:bg-[#166534] text-white text-[11px] font-bold rounded-md"
                        >
                          Unblock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add To Blocklist Form */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-[#E7E5E4] p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#1C1917] pb-2 border-b border-[#E7E5E4] flex items-center gap-1.5">
            <UserX className="w-4 h-4 text-[#B91C1C]" />
            <span>নতুন নম্বর ব্লক করুন (Add to Blocklist)</span>
          </h3>

          {error && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-md text-xs text-[#B91C1C] flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAddBlock} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold mb-1">১১ ডিজিটের মোবাইল নম্বর</label>
              <input
                type="tel"
                required
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full p-2.5 bg-[#FAF9F5] border border-[#D6D3D1] rounded-lg font-mono text-[#1C1917]"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">ব্লক করার সুনির্দিষ্ট কারণ (Mandatory Reason)</label>
              <textarea
                rows={3}
                required
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                placeholder="e.g. পার্সেল ডেলিভারিতে যাওয়ার পর মোবাইল বন্ধ রাখে..."
                className="w-full p-2.5 bg-[#FAF9F5] border border-[#D6D3D1] rounded-lg text-[#1C1917]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#B91C1C] hover:bg-[#991B1B] disabled:opacity-50 text-white font-bold rounded-lg text-xs"
            >
              {loading ? 'ব্লক হচ্ছে...' : 'Add to Blocklist'}
            </button>
          </form>

          <p className="text-[11px] text-[#78716C] leading-relaxed pt-2 border-t">
            🛡️ ব্লক করা নম্বরটি দিয়ে গ্রাহক চেকআউট করতে পারবে না। অর্ডার গ্রহণ স্বয়ংক্রিয়ভাবে প্রত্যাখ্যাত হবে।
          </p>
        </div>
      </div>
    </div>
  );
}
