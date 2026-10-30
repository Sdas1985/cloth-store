'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Truck,
  ShoppingBag,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Lock,
  Phone,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { DistrictSelector, SelectedDistrict } from '@/components/DistrictSelector';
import { validateBangladeshiPhone } from '@/lib/phone';
import { CartItem } from '@/lib/types';

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get('buyNow') === '1';

  const { items: cartItems, subtotal: cartSubtotal, clearCart } = useCart();

  // Handle direct buy-now items vs regular shopping bag items
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isBuyNow) {
      try {
        const directData = sessionStorage.getItem('roxy_direct_checkout_item');
        if (directData) {
          const directItem = JSON.parse(directData);
          if (!directItem.id) {
            directItem.id = `buyNow-${directItem.productId}-${directItem.variantId || '0'}`;
          }
          setCheckoutItems([directItem]);
          setIsReady(true);
          return;
        }
      } catch (e) {
        console.error('Failed to parse direct checkout item:', e);
      }
    }

    // Default to regular shopping bag items
    setCheckoutItems(cartItems);
    setIsReady(true);
  }, [isBuyNow, cartItems]);

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<SelectedDistrict | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);

  // Delivery and Totals Calculation
  const [deliveryCharge, setDeliveryCharge] = useState<number>(150); // Default national charge
  const [isFreeDelivery, setIsFreeDelivery] = useState<boolean>(false);
  const [deliveryRuleName, setDeliveryRuleName] = useState<string>('Standard Delivery');
  const [isCalculatingDelivery, setIsCalculatingDelivery] = useState(false);

  // Validation & Submission States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Session Token for Privacy-Aware Abandonment Tracking
  const sessionTokenRef = useRef<string>('');

  useEffect(() => {
    let token = sessionStorage.getItem('roxy_checkout_session_token');
    if (!token) {
      token = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem('roxy_checkout_session_token', token);
    }
    sessionTokenRef.current = token;
  }, []);

  const subtotal = useMemo(() => {
    return checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [checkoutItems]);

  // Recalculate delivery fee when district changes
  useEffect(() => {
    if (!selectedDistrict) {
      setDeliveryCharge(150);
      return;
    }

    async function fetchDelivery() {
      setIsCalculatingDelivery(true);
      try {
        const res = await fetch('/api/delivery/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            districtId: selectedDistrict?.id,
            subtotal,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setDeliveryCharge(data.deliveryCharge);
          setIsFreeDelivery(data.isFreeDelivery);
          setDeliveryRuleName(data.ruleApplied);
        }
      } catch (err) {
        console.error('Delivery fee calculation error:', err);
      } finally {
        setIsCalculatingDelivery(false);
      }
    }

    fetchDelivery();
  }, [selectedDistrict, subtotal]);

  const grandTotal = Math.max(0, subtotal + deliveryCharge);

  // Debounced checkout session progress sync for abandonment tracking
  useEffect(() => {
    if (!sessionTokenRef.current || checkoutItems.length === 0) return;

    const timer = setTimeout(() => {
      fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken: sessionTokenRef.current,
          customerName: customerName.trim() || undefined,
          customerPhone: customerPhone.trim() || undefined,
          districtId: selectedDistrict?.id || undefined,
          deliveryAddress: deliveryAddress.trim() || undefined,
          orderNote: orderNote.trim() || undefined,
          items: checkoutItems.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            name: i.name,
            sku: i.sku,
            price: i.price,
            quantity: i.quantity,
            size: i.size,
            color: i.color,
            image: i.image,
          })),
          estimatedTotal: grandTotal,
          checkoutStage: deliveryAddress ? 'address_entered' : selectedDistrict ? 'delivery_selected' : 'contact_entered',
          marketingConsent,
        }),
      }).catch((err) => console.error('Session sync error:', err));
    }, 1500);

    return () => clearTimeout(timer);
  }, [customerName, customerPhone, selectedDistrict, deliveryAddress, orderNote, checkoutItems, grandTotal, marketingConsent]);

  // Validation
  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!customerName.trim() || customerName.trim().length < 2) {
      errs.customerName = 'আপনার সম্পূর্ণ নাম দিন (Full name is required)';
    }

    const phoneVal = validateBangladeshiPhone(customerPhone);
    if (!phoneVal.isValid) {
      errs.customerPhone = phoneVal.error || 'সঠিক ১১ ডিজিটের ফোন নম্বর দিন';
    }

    if (!selectedDistrict) {
      errs.district = 'অনুগ্রহ করে জেলা নির্বাচন করুন (District is required)';
    }

    if (!deliveryAddress.trim() || deliveryAddress.trim().length < 5) {
      errs.deliveryAddress = 'বিস্তারিত ডেলিভারি ঠিকানা লিখুন (e.g. বাড়ি/ফ্ল্যাট, রোড, এলাকা)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Place Order Action
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (isSubmitting) return; // Prevent duplicate clicks
    if (!validateForm()) return;

    if (checkoutItems.length === 0) {
      setSubmitError('আপনার শপিং ব্যাগে কোনো প্রোডাক্ট নেই');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          districtId: selectedDistrict!.id,
          deliveryAddress: deliveryAddress.trim(),
          orderNote: orderNote.trim() || undefined,
          items: checkoutItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId || null,
            quantity: item.quantity,
          })),
          checkoutSessionId: sessionTokenRef.current,
          marketingConsent,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setSubmitError(result.error || 'অর্ডার গ্রহণ করা সম্ভব হয়নি। আবার চেষ্টা করুন।');
        setIsSubmitting(false);
        return;
      }

      // Order Succeeded! Clean up state
      if (!isBuyNow) {
        clearCart();
      } else {
        sessionStorage.removeItem('roxy_direct_checkout_item');
      }
      sessionStorage.removeItem('roxy_checkout_session_token');

      // Navigate to order confirmation
      router.push(`/order-confirmation/${result.publicReference}`);
    } catch (err: any) {
      console.error('Order submission error:', err);
      setSubmitError('সার্ভারে যোগাযোগ করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করে পুনরায় চেষ্টা করুন।');
      setIsSubmitting(false);
    }
  };

  if (!isReady) {
    return (
      <div className="py-20 text-center text-sm text-[#78716C]">
        চেকআউট প্রস্তুত হচ্ছে...
      </div>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-[#1C1917] mb-2">চেকআউট করার জন্য কোনো পণ্য নেই</h2>
        <p className="text-sm text-[#57534E] mb-6">আপনার শপিং ব্যাগে পণ্য যোগ করে চেকআউট করুন।</p>
        <Link
          href="/products"
          className="px-6 py-3 bg-[#631322] text-white text-sm font-semibold rounded-md"
        >
          প্রোডাক্ট দেখুন
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Banner */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-[#78716C] mb-1">
          <Link href="/cart" className="hover:text-[#631322]">Bag</Link>
          <span>/</span>
          <span className="text-[#1C1917] font-medium">Checkout</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917]">
          Fast Checkout (অর্ডার সম্পন্ন করুন)
        </h1>
        <p className="text-xs sm:text-sm text-[#57534E] mt-1 font-bengali">
          অ্যাকাউন্ট খোলার কোনো ঝামেলা নেই। আপনার ঠিকানা দিয়ে এক মিনিটেই অর্ডার নিশ্চিত করুন।
        </p>
      </div>

      <form onSubmit={handlePlaceOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Customer Details & District Selector */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-[#E7E5E4] p-5 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
                <h3 className="text-base font-bold text-[#1C1917] flex items-center gap-2">
                  <span>১. আপনার নাম ও ঠিকানা (Delivery Details)</span>
                </h3>
                <span className="text-xs text-[#15803D] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>নিরাপদ অর্ডার</span>
                </span>
              </div>

              {/* Customer Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#1C1917]">
                  আপনার পূর্ণ নাম (Full Name) <span className="text-[#B91C1C]">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (errors.customerName) setErrors({ ...errors, customerName: '' });
                  }}
                  placeholder="আপনার নাম লিখুন (e.g. Asif Mahmud)"
                  className={`w-full py-2.5 px-3.5 bg-white border rounded-lg text-sm focus:outline-hidden text-[#1C1917] ${
                    errors.customerName
                      ? 'border-[#B91C1C] ring-1 ring-[#B91C1C]'
                      : 'border-[#D6D3D1] focus:border-[#631322]'
                  }`}
                />
                {errors.customerName && (
                  <p className="text-xs text-[#B91C1C] mt-1">{errors.customerName}</p>
                )}
              </div>

              {/* Mobile Number with Bangladesh formatting guide */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#1C1917]">
                  ১১ ডিজিটের মোবাইল নম্বর (Mobile Number) <span className="text-[#B91C1C]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      if (errors.customerPhone) setErrors({ ...errors, customerPhone: '' });
                    }}
                    placeholder="017XXXXXXXX বা 018XXXXXXXX"
                    className={`w-full py-2.5 pl-3.5 pr-10 bg-white border rounded-lg text-sm focus:outline-hidden text-[#1C1917] ${
                      errors.customerPhone
                        ? 'border-[#B91C1C] ring-1 ring-[#B91C1C]'
                        : 'border-[#D6D3D1] focus:border-[#631322]'
                    }`}
                  />
                  <Phone className="w-4 h-4 text-[#78716C] absolute right-3.5 top-3" />
                </div>
                <p className="text-[11px] text-[#78716C]">
                  অর্ডার কনফার্মেশন ও ডেলিভারির জন্য সচল নম্বর দিন (দেশের কোড +88 দেওয়ার প্রয়োজন নেই)
                </p>
                {errors.customerPhone && (
                  <p className="text-xs text-[#B91C1C] mt-1">{errors.customerPhone}</p>
                )}
              </div>

              {/* Searchable 64 District Selector */}
              <div>
                <DistrictSelector
                  selectedDistrictId={selectedDistrict?.id || null}
                  onSelect={(d) => {
                    setSelectedDistrict(d);
                    if (errors.district) setErrors({ ...errors, district: '' });
                  }}
                  error={errors.district}
                />
              </div>

              {/* Full Address */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#1C1917]">
                  সম্পূর্ণ ডেলিভারি ঠিকানা (Detailed Delivery Address) <span className="text-[#B91C1C]">*</span>
                </label>
                <textarea
                  rows={3}
                  value={deliveryAddress}
                  onChange={(e) => {
                    setDeliveryAddress(e.target.value);
                    if (errors.deliveryAddress) setErrors({ ...errors, deliveryAddress: '' });
                  }}
                  placeholder="বাড়ি বা ফ্ল্যাট নম্বর, রোড, এলাকা, থানা/উপজেলা উল্লেখ করুন (e.g. বাড়ি নং ১২, রোড নং ৫, ধানমন্ডি, ঢাকা)"
                  className={`w-full py-2.5 px-3.5 bg-white border rounded-lg text-sm focus:outline-hidden text-[#1C1917] ${
                    errors.deliveryAddress
                      ? 'border-[#B91C1C] ring-1 ring-[#B91C1C]'
                      : 'border-[#D6D3D1] focus:border-[#631322]'
                  }`}
                />
                {errors.deliveryAddress && (
                  <p className="text-xs text-[#B91C1C] mt-1">{errors.deliveryAddress}</p>
                )}
              </div>

              {/* Order Note (Optional) */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#57534E]">
                  অর্ডার সংক্রান্ত বিশেষ নির্দেশনা (Order Note - Optional)
                </label>
                <input
                  type="text"
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="ডেলিভারির কোনো নির্দিষ্ট সময় বা নির্দেশনা থাকলে লিখুন..."
                  className="w-full py-2.5 px-3.5 bg-white border border-[#D6D3D1] focus:border-[#631322] rounded-lg text-sm focus:outline-hidden text-[#1C1917]"
                />
              </div>

              {/* Privacy-Compliant Marketing Consent */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#57534E]">
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    className="mt-0.5 rounded border-[#D6D3D1] text-[#631322] focus:ring-[#631322]"
                  />
                  <span>
                    ভবিষ্যতে নতুন কালেকশন ও স্পেশাল ডিসকাউন্ট অফারের আপডেট পেতে চাই।
                  </span>
                </label>
              </div>
            </div>

            {/* Payment Method: Cash on Delivery (COD) Only */}
            <div className="bg-white rounded-2xl border border-[#E7E5E4] p-5 sm:p-7 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-[#1C1917] pb-3 border-b border-[#E7E5E4]">
                ২. পেমেন্ট পদ্ধতি (Payment Method)
              </h3>

              <div className="p-4 rounded-xl border-2 border-[#631322] bg-[#FAF9F5] flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#631322] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-[#1C1917]">ক্যাশ অন ডেলিভারি (Cash on Delivery)</h4>
                    <span className="text-xs font-bold text-[#631322] bg-[#F7EAEF] px-2.5 py-0.5 rounded-full">
                      COD
                    </span>
                  </div>
                  <p className="text-xs text-[#57534E] mt-1 font-bengali">
                    পণ্যটি হাতে পাওয়ার পর ডেলিভারি পার্সনের সামনে চেক করে পুরো মূল্য পরিশোধ করুন। কোনো অগ্রিম পেমেন্টের প্রয়োজন নেই।
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Placement Action */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-[#E7E5E4] p-5 sm:p-7 shadow-xs space-y-5 sticky top-24">
              <h3 className="text-base font-bold text-[#1C1917] pb-3 border-b border-[#E7E5E4]">
                অর্ডার সারসংক্ষেপ (Order Summary)
              </h3>

              {/* Items List */}
              <div className="divide-y divide-[#F5F3EF] max-h-64 overflow-y-auto pr-1">
                {checkoutItems.map((item) => (
                  <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex gap-3">
                    <div className="w-14 h-18 bg-[#F5F3EF] rounded-md overflow-hidden shrink-0 border border-[#E7E5E4]">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-[#1C1917] truncate">{item.name}</h4>
                      <div className="text-[11px] text-[#78716C] mt-0.5">
                        {item.size && <span>Size: {item.size} </span>}
                        {item.color && <span>• {item.color} </span>}
                        <span>• Qty: {item.quantity}</span>
                      </div>
                      <div className="mt-1 text-xs font-bold text-[#631322]">
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="pt-3 border-t border-[#E7E5E4] space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-[#57534E]">
                  <span>প্রোডাক্ট সাবটোটাল (Subtotal)</span>
                  <span className="font-semibold text-[#1C1917]">৳{subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-[#57534E]">
                  <div className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-[#631322]" />
                    <span>ডেলিভারি চার্জ</span>
                    {selectedDistrict && (
                      <span className="text-[10px] text-[#78716C]">({selectedDistrict.nameEn})</span>
                    )}
                  </div>
                  <span className="font-semibold text-[#1C1917]">
                    {isCalculatingDelivery ? (
                      <span className="text-xs text-[#78716C]">হিসাব হচ্ছে...</span>
                    ) : isFreeDelivery ? (
                      <span className="text-[#15803D] font-bold">ফ্রি (Free)</span>
                    ) : (
                      `৳${deliveryCharge}`
                    )}
                  </span>
                </div>

                <div className="pt-3 border-t border-[#E7E5E4] flex justify-between items-center text-base sm:text-lg font-bold text-[#1C1917]">
                  <span>মোট প্রদেয় (Total Payable)</span>
                  <span className="text-xl sm:text-2xl text-[#631322]">
                    ৳{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Submission Error Banner */}
              {submitError && (
                <div className="p-3.5 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-xs text-[#B91C1C] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Complete Order Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-4 bg-[#631322] hover:bg-[#4E0E1A] disabled:bg-[#A8A29E] text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>অর্ডার সম্পন্ন হচ্ছে...</span>
                  </div>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>অর্ডার নিশ্চিত করুন (Place Order - COD)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center space-y-1">
                <p className="text-[11px] text-[#78716C]">
                  ⚡ কোনো অগ্রিম টাকা লাগবে না • ডেলিভারিম্যানকে পণ্য দেখে টাকা দিন
                </p>
                <p className="text-[11px] text-[#57534E]">
                  প্রয়োজনে কল করুন: <a href="tel:+8801762556262" className="font-semibold text-[#631322] underline">01762-556262</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF9F5] py-16 flex items-center justify-center">
          <div className="text-center font-bengali text-[#78716C]">
            <div className="w-10 h-10 border-4 border-[#631322] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm">চেকআউট পেজ লোড হচ্ছে...</p>
          </div>
        </div>
      }
    >
      <CheckoutForm />
    </React.Suspense>
  );
}
