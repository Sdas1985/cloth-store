'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Package, Clock, CheckCircle2, Truck, AlertCircle } from 'lucide-react';
import { Order, OrderItem } from '@/lib/types';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || '';

  const [reference, setReference] = useState(initialRef);
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    if (initialRef) {
      handleSearch(initialRef);
    }
  }, [initialRef]);

  const handleSearch = async (refQuery?: string) => {
    const q = (refQuery || reference).trim();
    if (!q) {
      setError('অর্ডার রেফারেন্স নম্বর দেওয়া আবশ্যক (Reference number is required)');
      return;
    }

    setIsLoading(true);
    setError('');
    setOrder(null);
    setItems([]);

    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: q, phone: phone.trim() || undefined }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'এই রেফারেন্সে কোনো অর্ডার পাওয়া যায়নি। নম্বরটি সঠিকভাবে দিন।');
      } else {
        setOrder(data.order);
        setItems(data.items || []);
      }
    } catch (err) {
      setError('ট্র্যাকিং তথ্য লোড করা যায়নি। ইন্টারনেট সংযোগ চেক করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'pending': return 1;
      case 'confirmed': return 2;
      case 'processing': return 3;
      case 'shipped': return 4;
      case 'delivered': return 5;
      default: return 1;
    }
  };

  const currentStep = order ? getStatusStep(order.fulfillment_status) : 1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#631322]">
          Live Tracking
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917] mt-1">
          অর্ডার ট্র্যাক করুন (Track Your Order)
        </h1>
        <p className="text-xs sm:text-sm text-[#57534E] mt-2 font-bengali">
          অর্ডার কনফার্মেশনের সময় প্রাপ্ত রেফারেন্স নম্বর (e.g. ROX-XXXX-XXXXXX) দিন।
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-5 sm:p-7 shadow-xs mb-8 max-w-2xl mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="space-y-4"
        >
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#1C1917]">
              অর্ডার রেফারেন্স নম্বর (Order Reference)
            </label>
            <div className="relative">
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. ROX-2610-842910"
                className="w-full py-2.5 pl-3.5 pr-10 bg-white border border-[#D6D3D1] focus:border-[#631322] rounded-lg text-sm focus:outline-hidden text-[#1C1917]"
              />
              <Package className="w-4 h-4 text-[#78716C] absolute right-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#631322] hover:bg-[#4E0E1A] disabled:bg-[#A8A29E] text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <span>তথ্য খোঁজা হচ্ছে...</span>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>অর্ডার স্ট্যাটাস দেখুন (Track Now)</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-xs text-[#B91C1C] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Tracking Results Card */}
      {order && (
        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 sm:p-8 shadow-md space-y-8 animate-fadeIn">
          {/* Order Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-[#E7E5E4] gap-4">
            <div>
              <span className="text-xs text-[#78716C]">Order Reference:</span>
              <h2 className="text-xl font-bold font-mono text-[#631322]">{order.public_reference}</h2>
              <div className="text-xs text-[#57534E] mt-0.5">
                অর্ডারের তারিখ: {new Date(order.created_at).toLocaleDateString('bn-BD')}
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-[#78716C]">Payment Status:</span>
              <div className="text-sm font-bold text-[#1C1917]">Cash on Delivery (COD)</div>
              <div className="text-sm font-semibold text-[#631322]">৳{Number(order.total_amount).toLocaleString()}</div>
            </div>
          </div>

          {/* Fulfillment Progress Timeline */}
          <div>
            <h3 className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-6">
              ডেলিভারি অগ্রগতি (Delivery Timeline)
            </h3>

            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              {[
                { step: 1, label: 'পেন্ডিং', labelEn: 'Pending' },
                { step: 2, label: 'কনফার্মড', labelEn: 'Confirmed' },
                { step: 3, label: 'প্রসেসিং', labelEn: 'Processing' },
                { step: 4, label: 'ডেলিভারিতে', labelEn: 'Shipped' },
                { step: 5, label: 'পৌঁছেছে', labelEn: 'Delivered' },
              ].map((s) => {
                const isPassed = currentStep >= s.step;
                const isCurrent = currentStep === s.step;

                return (
                  <div key={s.step} className="space-y-2">
                    <div
                      className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                        isPassed
                          ? 'bg-[#631322] text-white shadow-xs'
                          : 'bg-[#F5F3EF] text-[#A8A29E] border border-[#E7E5E4]'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : s.step}
                    </div>
                    <div>
                      <div className={`font-semibold ${isCurrent ? 'text-[#631322]' : 'text-[#1C1917]'}`}>
                        {s.label}
                      </div>
                      <div className="text-[10px] text-[#78716C]">{s.labelEn}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer & Address Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#FAF9F5] border border-[#E7E5E4] text-xs">
            <div>
              <span className="font-bold text-[#1C1917]">গ্রাহক:</span> {order.customer_name}<br />
              <span className="font-bold text-[#1C1917]">মোবাইল:</span> {order.customer_phone}
            </div>
            <div>
              <span className="font-bold text-[#1C1917]">ডেলিভারি ঠিকানা:</span> {order.delivery_address}<br />
              <span className="font-bold text-[#1C1917]">জেলা:</span> {order.district_name}
            </div>
          </div>

          {/* Ordered Products */}
          {items.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-3">
                অর্ডারকৃত পোশাকসমূহ (Items)
              </h4>
              <div className="divide-y divide-[#E7E5E4] border rounded-lg overflow-hidden text-xs">
                {items.map((i) => (
                  <div key={i.id} className="p-3 bg-white flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-[#1C1917]">{i.product_name}</div>
                      <div className="text-[#78716C]">{i.variant_details} • Qty: {i.quantity}</div>
                    </div>
                    <div className="font-bold text-[#631322]">৳{Number(i.total_price).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <React.Suspense
      fallback={
        <div className="max-w-2xl mx-auto px-4 py-16 text-center text-[#78716C] font-bengali">
          <div className="w-8 h-8 border-4 border-[#631322] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">ট্র্যাকিং তথ্য লোড হচ্ছে...</p>
        </div>
      }
    >
      <TrackOrderContent />
    </React.Suspense>
  );
}
