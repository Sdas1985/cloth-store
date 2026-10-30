'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function CartDrawer() {
  const { items, itemCount, subtotal, removeItem, updateQuantity, isCartOpen, setIsCartOpen } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FFFFFF] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#E7E5E4] flex items-center justify-between bg-[#FAF9F5]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#631322]" />
              <h2 className="text-lg font-semibold text-[#1C1917] tracking-tight">
                Shopping Bag <span className="text-sm font-normal text-[#57534E]">({itemCount})</span>
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F3EF] rounded-full transition-colors"
              aria-label="Close bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 divide-y divide-[#E7E5E4]">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#FAF9F5] flex items-center justify-center mb-4 text-[#631322]">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <p className="text-base font-medium text-[#1C1917] mb-1">আপনার শপিং ব্যাগ খালি</p>
                <p className="text-sm text-[#57534E] mb-6">Your shopping bag is currently empty.</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 bg-[#631322] text-white text-sm font-medium rounded-md hover:bg-[#4E0E1A] transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                  <div className="relative w-20 h-24 bg-[#F5F3EF] rounded-md overflow-hidden shrink-0 border border-[#E7E5E4]">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=300&q=80'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-[#1C1917] line-clamp-1">{item.name}</h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[#57534E] hover:text-[#B91C1C] p-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {(item.size || item.color) && (
                        <div className="flex items-center gap-2 mt-1 text-xs text-[#57534E]">
                          {item.size && <span>Size: <strong className="text-[#1C1917]">{item.size}</strong></span>}
                          {item.size && item.color && <span>•</span>}
                          {item.color && <span>Color: <strong className="text-[#1C1917]">{item.color}</strong></span>}
                        </div>
                      )}

                      <div className="mt-1 text-xs text-[#78716C]">SKU: {item.sku}</div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-[#E7E5E4] rounded-md bg-[#FAF9F5]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-[#E7E5E4] text-[#1C1917] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-[#1C1917]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-[#E7E5E4] text-[#1C1917] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <span className="text-sm font-semibold text-[#631322]">
                          ৳{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Subtotal and Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#E7E5E4] bg-[#FAF9F5] space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-[#57534E]">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#1C1917]">৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#57534E] text-xs">
                  <span>Delivery Charge</span>
                  <span className="text-[#631322]">Calculated at checkout (Chattogram ৳80 / Others ৳150)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E7E5E4] flex justify-between items-center text-base font-bold text-[#1C1917]">
                <span>Estimated Subtotal</span>
                <span className="text-lg text-[#631322]">৳{subtotal.toLocaleString()}</span>
              </div>

              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#631322] hover:bg-[#4E0E1A] text-white font-medium rounded-md shadow-sm transition-colors text-sm"
                >
                  Proceed to Checkout (ক্যাশ অন ডেলিভারি)
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full block text-center py-2 text-xs font-medium text-[#57534E] hover:text-[#1C1917] transition-colors underline underline-offset-4"
                >
                  View Full Bag Details
                </Link>
              </div>

              <p className="text-center text-xs text-[#78716C]">
                ⚡ ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
