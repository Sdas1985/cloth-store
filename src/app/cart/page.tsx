'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, Truck, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { items, itemCount, subtotal, removeItem, updateQuantity } = useCart();

  const freeDeliveryThreshold = 3000;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-white rounded-full border border-[#E7E5E4] flex items-center justify-center mx-auto mb-4 text-[#631322] shadow-sm">
          <ShoppingBag className="w-10 h-10 opacity-70" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-[#1C1917]">আপনার শপিং ব্যাগ খালি</h1>
        <p className="text-sm text-[#57534E] mt-2 mb-8">
          Your shopping bag is currently empty. Explore our luxury collection of Panjabis and Designer Wear.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#631322] text-white font-medium rounded-md hover:bg-[#4E0E1A] transition-colors"
        >
          <span>Start Shopping (কেনাকাটা শুরু করুন)</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917] mb-2">
        Shopping Bag (শপিং ব্যাগ)
      </h1>
      <p className="text-xs sm:text-sm text-[#57534E] mb-8">
        You have {itemCount} {itemCount === 1 ? 'item' : 'items'} in your bag.
      </p>

      {/* Free Delivery Goal Bar */}
      <div className="mb-8 p-4 bg-white rounded-xl border border-[#E7E5E4] shadow-xs">
        <div className="flex justify-between items-center text-xs font-semibold mb-2">
          <div className="flex items-center gap-1.5 text-[#1C1917]">
            <Truck className="w-4 h-4 text-[#631322]" />
            <span>
              {remainingForFreeDelivery === 0 ? (
                <strong className="text-[#15803D]">অভিনন্দন! আপনি পাচ্ছেন সম্পূর্ণ ফ্রি ডেলিভারি! 🎉</strong>
              ) : (
                <>
                  আর মাত্র <strong className="text-[#631322]">৳{remainingForFreeDelivery.toLocaleString()}</strong> টাকার কেনাকাটায় পাচ্ছেন ফ্রি ডেলিভারি!
                </>
              )}
            </span>
          </div>
          <span className="text-[#78716C]">{freeDeliveryPercent}%</span>
        </div>
        <div className="w-full bg-[#E7E5E4] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#631322] h-full transition-all duration-500 rounded-full"
            style={{ width: `${freeDeliveryPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-[#E7E5E4] p-4 sm:p-6 divide-y divide-[#E7E5E4]">
          {items.map((item) => (
            <div key={item.id} className="py-4 sm:py-6 first:pt-0 last:pb-0 flex gap-4 sm:gap-6">
              <div className="relative w-24 h-32 sm:w-28 sm:h-36 bg-[#F5F3EF] rounded-lg overflow-hidden shrink-0 border border-[#E7E5E4]">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <Link href={`/product/${item.slug}`} className="text-sm sm:text-base font-semibold text-[#1C1917] hover:text-[#631322]">
                      {item.name}
                    </Link>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-[#78716C] hover:text-[#B91C1C] p-1 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {(item.size || item.color) && (
                    <div className="flex items-center gap-3 mt-1 text-xs text-[#57534E]">
                      {item.size && <span>Size: <strong className="text-[#1C1917]">{item.size}</strong></span>}
                      {item.color && <span>Color: <strong className="text-[#1C1917]">{item.color}</strong></span>}
                    </div>
                  )}

                  <div className="text-xs text-[#78716C] mt-1">SKU: {item.sku}</div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-2">
                  {/* Quantity */}
                  <div className="flex items-center border border-[#D6D3D1] rounded-md bg-[#FAF9F5]">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 hover:bg-[#E7E5E4] text-[#1C1917]"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-xs font-bold text-[#1C1917]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 hover:bg-[#E7E5E4] text-[#1C1917]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <div className="text-base sm:text-lg font-bold text-[#631322]">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </div>
                    {item.quantity > 1 && (
                      <div className="text-xs text-[#78716C]">
                        ৳{item.price.toLocaleString()} each
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-[#E7E5E4] p-6 space-y-4">
            <h3 className="text-base font-bold text-[#1C1917] pb-3 border-b border-[#E7E5E4]">
              Order Summary (অর্ডার সারসংক্ষেপ)
            </h3>

            <div className="space-y-2 text-xs sm:text-sm text-[#57534E]">
              <div className="flex justify-between">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-semibold text-[#1C1917]">৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Delivery</span>
                <span className="text-[#631322]">Chattogram ৳80 / Others ৳150</span>
              </div>
              <div className="flex justify-between text-xs text-[#78716C]">
                <span>Payment Method</span>
                <span>Cash on Delivery (COD)</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E7E5E4] flex justify-between items-center text-base font-bold text-[#1C1917]">
              <span>Estimated Total</span>
              <span className="text-xl text-[#631322]">৳{subtotal.toLocaleString()}</span>
            </div>

            <Link
              href="/checkout"
              className="w-full py-4 px-4 bg-[#631322] hover:bg-[#4E0E1A] text-white font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 text-sm text-center"
            >
              <span>Proceed to Checkout (চেকআউট করুন)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/products"
              className="w-full block text-center py-2 text-xs font-semibold text-[#57534E] hover:text-[#1C1917] transition-colors"
            >
              ← Continue Shopping (আরও কেনাকাটা করুন)
            </Link>
          </div>

          <div className="bg-[#FAF9F5] rounded-xl border border-[#E7E5E4] p-4 text-xs text-[#57534E] space-y-2">
            <div className="flex items-center gap-2 font-semibold text-[#1C1917]">
              <ShieldCheck className="w-4 h-4 text-[#631322]" />
              <span>নিরাপদ ক্যাশ অন ডেলিভারি</span>
            </div>
            <p>
              কোনো অগ্রিম পেমেন্ট ছাড়াই অর্ডার করুন। পার্সেল হাতে পেয়ে ডেলিভারিম্যানের সামনে দেখে মূল্য পরিশোধ করুন।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
