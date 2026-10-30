'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  ArrowRight,
  Truck,
  ShieldCheck,
  Check,
  Ruler,
  Clock,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { Product, ProductVariant } from '@/lib/types';
import { useCart } from '@/context/CartContext';

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const router = useRouter();
  const { addItem } = useCart();

  const isVariable = product.product_type === 'variable' && (product.variants?.length || 0) > 0;

  // Gallery state
  const allImages = useMemo(() => {
    const list = [product.main_image];
    if (product.gallery_images && Array.isArray(product.gallery_images)) {
      product.gallery_images.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list;
  }, [product]);

  const [activeImage, setActiveImage] = useState(allImages[0] || product.main_image);
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [addedToast, setAddedToast] = useState(false);

  // Variant selection state
  // Robust extraction of unique available sizes and colors
  const availableSizes = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return [];
    const map = new Map<string, { id: string; name: string }>();
    product.variants.forEach((v) => {
      const name = (v.size_name || (v.size_id != null ? String(v.size_id) : '')).trim();
      if (name && !map.has(name)) {
        map.set(name, { id: name, name });
      }
    });
    return Array.from(map.values());
  }, [product.variants]);

  const availableColors = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return [];
    const map = new Map<string, { id: string; nameEn: string; nameBn: string; hex: string }>();
    product.variants.forEach((v) => {
      const nameEn = (v.color_name_en || (v.color_id != null ? String(v.color_id) : '')).trim();
      if (nameEn && !map.has(nameEn)) {
        map.set(nameEn, {
          id: nameEn,
          nameEn,
          nameBn: v.color_name_bn || nameEn,
          hex: v.color_hex || '#102A43',
        });
      }
    });
    return Array.from(map.values());
  }, [product.variants]);

  // Selected size & color names
  const [selectedSizeName, setSelectedSizeName] = useState<string | null>(null);
  const [selectedColorName, setSelectedColorName] = useState<string | null>(null);

  // Auto-select initial in-stock variant on product mount/change
  React.useEffect(() => {
    if (isVariable && product.variants && product.variants.length > 0) {
      const firstInStock = product.variants.find((v) => v.stock_quantity > 0 && v.is_enabled) || product.variants[0];
      if (firstInStock) {
        if (firstInStock.size_name) setSelectedSizeName(firstInStock.size_name.trim());
        if (firstInStock.color_name_en) setSelectedColorName(firstInStock.color_name_en.trim());
      }
    }
  }, [isVariable, product]);

  // Find active variant matching size and color
  const activeVariant = useMemo<ProductVariant | null>(() => {
    if (!isVariable || !product.variants || product.variants.length === 0) return null;
    return (
      product.variants.find((v) => {
        const matchSize = selectedSizeName ? (v.size_name || '').trim() === selectedSizeName : true;
        const matchColor = selectedColorName ? (v.color_name_en || '').trim() === selectedColorName : true;
        return matchSize && matchColor && v.is_enabled;
      }) || product.variants[0] || null
    );
  }, [isVariable, product.variants, selectedSizeName, selectedColorName]);

  // Compute live price and stock based on active variant or base product
  const livePrice = activeVariant?.sale_price || activeVariant?.regular_price || product.sale_price || product.regular_price;
  const liveRegularPrice = activeVariant?.regular_price || product.regular_price;
  const liveSku = activeVariant?.sku || product.sku;
  const liveStock = activeVariant ? activeVariant.stock_quantity : product.stock_quantity;
  const isOutOfStock = liveStock <= 0;

  const hasDiscount = Boolean(livePrice < liveRegularPrice);
  const discountPercent = hasDiscount
    ? Math.round(((liveRegularPrice - livePrice) / liveRegularPrice) * 100)
    : 0;

  // Validation logic
  const validateSelections = (): boolean => {
    if (isVariable) {
      if (availableSizes.length > 0 && !selectedSizeName) {
        setValidationError('অনুগ্রহ করে একটি সাইজ সিলেক্ট করুন (Please select a size)');
        return false;
      }
      if (availableColors.length > 0 && !selectedColorName) {
        setValidationError('অনুগ্রহ করে একটি রঙ সিলেক্ট করুন (Please select a color)');
        return false;
      }
      if (!activeVariant || activeVariant.stock_quantity <= 0) {
        setValidationError('নির্বাচিত সাইজ ও কালার কম্বিনেশন বর্তমানে স্টক আউট');
        return false;
      }
    } else if (product.stock_quantity <= 0) {
      setValidationError('এই প্রোডাক্টটি বর্তমানে স্টক আউট (This product is out of stock)');
      return false;
    }
    setValidationError('');
    return true;
  };

  // ADD TO BAG HANDLER
  const handleAddToBag = () => {
    if (!validateSelections()) return;

    const variantToUse = activeVariant || (product.variants && product.variants.length > 0 ? product.variants[0] : null);
    addItem(product, variantToUse, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  // ORDER NOW HANDLER
  // Direct purchase to checkout without adding to cart first
  const handleOrderNow = () => {
    if (!validateSelections()) return;

    const variantToUse = activeVariant || (product.variants && product.variants.length > 0 ? product.variants[0] : null);

    // 1. Also sync with cart context so state is safe even if sessionStorage is blocked
    addItem(product, variantToUse, quantity);

    // 2. Encode direct checkout item parameters
    const checkoutItem = {
      id: `buyNow-${product.id}-${variantToUse?.id || '0'}`,
      productId: product.id,
      variantId: variantToUse?.id || null,
      name: product.name_en,
      slug: product.slug,
      sku: liveSku,
      price: livePrice,
      regularPrice: liveRegularPrice,
      quantity,
      maxStock: liveStock || 99,
      size: variantToUse?.size_name,
      color: variantToUse?.color_name_en,
      image: variantToUse?.image_url || product.main_image,
    };

    try {
      sessionStorage.setItem('roxy_direct_checkout_item', JSON.stringify(checkoutItem));
    } catch (e) {
      console.warn('sessionStorage error:', e);
    }

    // 3. Immediately direct customer to checkout page
    window.location.href = '/checkout?buyNow=1';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Breadcrumb Navigation */}
      <nav className="text-xs text-[#78716C] mb-6 flex items-center gap-1.5 overflow-x-auto">
        <Link href="/" className="hover:text-[#631322] whitespace-nowrap">হোম (Home)</Link>
        <ChevronRight className="w-3 h-3 shrink-0" />
        {product.category_slug && (
          <>
            <Link href={`/category/${product.category_slug}`} className="hover:text-[#631322] whitespace-nowrap">
              {product.category_name_en || 'Category'}
            </Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
          </>
        )}
        <span className="text-[#1C1917] font-medium truncate">{product.name_en}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Gallery Section */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Hero Image */}
          <div className="relative aspect-3/4 rounded-xl overflow-hidden bg-[#F5F3EF] border border-[#E7E5E4] shadow-sm">
            <img
              src={activeImage}
              alt={product.name_en}
              className="w-full h-full object-cover object-top"
            />
            {hasDiscount && (
              <span className="absolute top-3 left-3 bg-[#631322] text-white text-xs font-bold px-3 py-1 rounded-sm shadow-md">
                {discountPercent}% OFF
              </span>
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                <span className="bg-white text-[#B91C1C] font-bold text-sm px-4 py-2 rounded-md uppercase tracking-wider">
                  স্টক শেষ (Out of Stock)
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 h-24 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                    activeImage === img ? 'border-[#631322] shadow-sm' : 'border-[#E7E5E4] opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name_en} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#631322]">
              {product.category_name_en || 'Exclusive Collection'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917] mt-1">
              {product.name_en}
            </h1>
            <p className="text-sm sm:text-base text-[#57534E] font-bengali mt-0.5">
              {product.name_bn}
            </p>

            <div className="mt-2 text-xs text-[#78716C] flex items-center gap-4">
              <span>SKU: <strong className="text-[#1C1917]">{liveSku}</strong></span>
              <span>•</span>
              <span className={isOutOfStock ? 'text-[#B91C1C] font-semibold' : 'text-[#15803D] font-semibold'}>
                {isOutOfStock ? 'স্টক শেষ' : `ইন স্টক (${liveStock} পিস অবশিষ্ট)`}
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#E7E5E4] space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-bold text-[#631322]">
                ৳{Number(livePrice).toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-base text-[#A8A29E] line-through font-medium">
                  ৳{Number(liveRegularPrice).toLocaleString()}
                </span>
              )}
            </div>
            <p className="text-xs text-[#15803D] font-medium">
              ক্যাশ অন ডেলিভারি সুবিধা (ডেলিভারির সময় মূল্য পরিশোধ করুন)
            </p>
          </div>

          {/* Variable Product: Color Selection */}
          {availableColors.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-[#1C1917]">
                <span>Color (রঙ):</span>
                <span className="font-normal text-[#57534E]">
                  {availableColors.find((c) => c.nameEn === selectedColorName)?.nameEn} (
                  {availableColors.find((c) => c.nameEn === selectedColorName)?.nameBn})
                </span>
              </div>
              <div className="flex items-center gap-3">
                {availableColors.map((color) => {
                  const isSelected = selectedColorName === color.nameEn;
                  return (
                    <button
                      key={color.id}
                      onClick={() => {
                        setSelectedColorName(color.nameEn);
                        setValidationError('');

                        // Auto-check if current size is valid for this color
                        if (product.variants) {
                          const variantWithCurrentSize = product.variants.find(
                            (v) => (v.color_name_en || '').trim() === color.nameEn &&
                                   (v.size_name || '').trim() === selectedSizeName &&
                                   v.stock_quantity > 0
                          );
                          if (!variantWithCurrentSize) {
                            // Pick first size available in this color
                            const anySizeInStock = product.variants.find(
                              (v) => (v.color_name_en || '').trim() === color.nameEn && v.stock_quantity > 0
                            );
                            if (anySizeInStock?.size_name) {
                              setSelectedSizeName(anySizeInStock.size_name.trim());
                            }
                          }
                        }
                      }}
                      className={`group relative flex items-center gap-2 p-1.5 rounded-full border-2 transition-all cursor-pointer ${
                        isSelected ? 'border-[#631322] shadow-xs scale-105' : 'border-[#E7E5E4] hover:border-[#A8A29E]'
                      }`}
                      title={color.nameEn}
                    >
                      <span
                        className="w-6 h-6 rounded-full border border-black/10 flex items-center justify-center text-white"
                        style={{ backgroundColor: color.hex }}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 drop-shadow-sm" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Variable Product: Size Selection & Size Guide */}
          {availableSizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-[#1C1917]">
                <span>Size (সাইজ):</span>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="flex items-center gap-1 text-[#631322] hover:underline cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Guide (সাইজ গাইড)</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => {
                  const isSelected = selectedSizeName === size.name;
                  // Check if this size combination is in stock with current selected color
                  const variantForSize = product.variants?.find(
                    (v) => (v.size_name || '').trim() === size.name &&
                           (selectedColorName ? (v.color_name_en || '').trim() === selectedColorName : true)
                  );
                  const isSizeDisabled = !variantForSize || variantForSize.stock_quantity <= 0;

                  return (
                    <button
                      key={size.id}
                      onClick={() => {
                        if (!isSizeDisabled) {
                          setSelectedSizeName(size.name);
                          setValidationError('');
                        }
                      }}
                      disabled={isSizeDisabled}
                      className={`min-w-14 py-2.5 px-3.5 text-xs font-semibold rounded-md border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#631322] bg-[#631322] text-white shadow-xs'
                          : isSizeDisabled
                          ? 'border-[#E7E5E4] bg-[#F5F3EF] text-[#A8A29E] cursor-not-allowed line-through'
                          : 'border-[#D6D3D1] bg-white text-[#1C1917] hover:border-[#631322]'
                      }`}
                    >
                      {size.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#1C1917]">Quantity (পরিমাণ):</span>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center border border-[#D6D3D1] rounded-md bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-sm text-[#1C1917] hover:bg-[#FAF9F5] transition-colors"
                >
                  -
                </button>
                <span className="w-10 text-center text-sm font-semibold text-[#1C1917]">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(liveStock || 99, q + 1))}
                  disabled={quantity >= liveStock}
                  className="px-3 py-2 text-sm text-[#1C1917] hover:bg-[#FAF9F5] transition-colors disabled:opacity-40"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-[#78716C]">
                সর্বোচ্চ {liveStock} পিস অর্ডার করতে পারবেন
              </span>
            </div>
          </div>

          {/* Validation Alert */}
          {validationError && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-md text-xs text-[#B91C1C] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Action Buttons: ORDER NOW & ADD TO BAG */}
          <div className="space-y-3 pt-2">
            {/* ORDER NOW: Validates selections & goes directly to checkout */}
            <button
              onClick={handleOrderNow}
              disabled={isOutOfStock}
              className="w-full py-4 px-6 bg-[#631322] hover:bg-[#4E0E1A] disabled:bg-[#A8A29E] text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 text-base cursor-pointer"
            >
              <span>ORDER NOW (অর্ডার করুন)</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* ADD TO BAG: Instant Bag Add with Drawer */}
            <button
              onClick={handleAddToBag}
              disabled={isOutOfStock}
              className="w-full py-3.5 px-6 bg-white hover:bg-[#FAF9F5] disabled:bg-[#F5F3EF] border-2 border-[#631322] disabled:border-[#D6D3D1] text-[#631322] disabled:text-[#A8A29E] font-semibold rounded-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>ADD TO BAG (ব্যাগে যোগ করুন)</span>
            </button>
          </div>

          {/* Added to Bag Toast confirmation */}
          {addedToast && (
            <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-md text-xs text-[#15803D] flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2 font-medium">
                <Check className="w-4 h-4" />
                <span>প্রোডাক্ট সফলভাবে শপিং ব্যাগে যোগ করা হয়েছে!</span>
              </div>
              <Link href="/checkout" className="underline font-semibold">
                Checkout Now
              </Link>
            </div>
          )}

          {/* Delivery Policy Breakdown Card */}
          <div className="rounded-xl border border-[#E7E5E4] bg-[#FFFFFF] p-4 space-y-3 text-xs text-[#57534E]">
            <div className="flex items-start gap-3">
              <Truck className="w-5 h-5 text-[#631322] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#1C1917]">ডেলিভারি চার্জ:</strong>
                <p className="mt-0.5">
                  • চট্টগ্রাম জেলা: <span className="font-semibold text-[#631322]">৮০ টাকা</span> (১-২ কার্যদিবস)<br />
                  • সমগ্র বাংলাদেশ: <span className="font-semibold text-[#631322]">১৫০ টাকা</span> (২-৩ কার্যদিবস)<br />
                  • ৩,০০০ টাকার কেনাকাটায় ডেলিভারি একদম <span className="font-semibold text-[#15803D]">ফ্রি</span>!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2 border-t border-[#F5F3EF]">
              <ShieldCheck className="w-5 h-5 text-[#631322] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#1C1917]">ক্যাশ অন ডেলিভারি গ্যারান্টি:</strong>
                <p className="mt-0.5">
                  পার্সেল রিসিভ করার সময় চেক করে ডেলিভারি বয়কে পেমেন্ট করুন।
                </p>
              </div>
            </div>
          </div>

          {/* Description & Specifications */}
          <div className="space-y-4 pt-4 border-t border-[#E7E5E4]">
            <div>
              <h3 className="text-sm font-bold text-[#1C1917] mb-2">বিবরণ (Description)</h3>
              <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed whitespace-pre-line">
                {product.full_description || product.short_description}
              </p>
            </div>

            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-[#1C1917] mb-2">স্পেসিফিকেশন (Specifications)</h3>
                <div className="rounded-md border border-[#E7E5E4] overflow-hidden text-xs">
                  {Object.entries(product.specifications).map(([key, val], idx) => (
                    <div
                      key={key}
                      className={`flex py-2 px-3 ${idx % 2 === 0 ? 'bg-[#FAF9F5]' : 'bg-white'}`}
                    >
                      <span className="w-1/3 font-semibold text-[#1C1917]">{key}</span>
                      <span className="w-2/3 text-[#57534E]">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 border border-[#E7E5E4] shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-[#E7E5E4]">
              <h3 className="text-base font-bold text-[#1C1917]">পাঞ্জাবি ও পোশাকের সাইজ গাইড (Size Chart)</h3>
              <button
                onClick={() => setSizeGuideOpen(false)}
                className="text-[#78716C] hover:text-[#1C1917] text-sm p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#57534E]">
              সকল মাপ ইঞ্চিতে (Inches) দেওয়া হলো। আপনার শারীরিক মাপের সাথে মিলিয়ে সঠিক সাইজ নির্বাচন করুন:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF9F5] border-b border-[#E7E5E4] text-[#1C1917]">
                    <th className="p-2.5 font-bold">Size</th>
                    <th className="p-2.5 font-bold">Chest (বুক)</th>
                    <th className="p-2.5 font-bold">Length (দৈর্ঘ্য)</th>
                    <th className="p-2.5 font-bold">Sleeve (হাতা)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E4] text-[#57534E]">
                  <tr>
                    <td className="p-2.5 font-semibold text-[#1C1917]">38 (S)</td>
                    <td className="p-2.5">38" - 40"</td>
                    <td className="p-2.5">38"</td>
                    <td className="p-2.5">24.5"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-[#1C1917]">40 (M)</td>
                    <td className="p-2.5">40" - 42"</td>
                    <td className="p-2.5">40"</td>
                    <td className="p-2.5">25"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-[#1C1917]">42 (L)</td>
                    <td className="p-2.5">42" - 44"</td>
                    <td className="p-2.5">42"</td>
                    <td className="p-2.5">25.5"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-[#1C1917]">44 (XL)</td>
                    <td className="p-2.5">44" - 46"</td>
                    <td className="p-2.5">44"</td>
                    <td className="p-2.5">26"</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSizeGuideOpen(false)}
                className="px-5 py-2 bg-[#631322] text-white text-xs font-semibold rounded-md"
              >
                বুঝেছি (Got It)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 sm:mt-24 pt-10 border-t border-[#E7E5E4]">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1C1917] mb-6">
            সম্পর্কিত কালেকশন (Related Products)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {relatedProducts.map((rel) => (
              <Link
                key={rel.id}
                href={`/product/${rel.slug}`}
                className="group bg-white rounded-lg border border-[#E7E5E4] overflow-hidden luxury-card"
              >
                <div className="aspect-3/4 bg-[#F5F3EF] overflow-hidden">
                  <img
                    src={rel.main_image}
                    alt={rel.name_en}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <h4 className="text-xs font-semibold text-[#1C1917] line-clamp-1">{rel.name_en}</h4>
                  <div className="mt-1 text-xs font-bold text-[#631322]">
                    ৳{Number(rel.sale_price || rel.regular_price).toLocaleString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
