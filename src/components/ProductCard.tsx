'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Check } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [addedAnimation, setAddedAnimation] = React.useState(false);

  const price = product.sale_price || product.regular_price;
  const hasDiscount = Boolean(product.sale_price && product.sale_price < product.regular_price);
  const discountPercent = hasDiscount
    ? Math.round(((product.regular_price - Number(product.sale_price)) / product.regular_price) * 100)
    : 0;

  const isOutOfStock = product.stock_status === 'out_of_stock' || product.stock_quantity <= 0;
  const isVariable = product.product_type === 'variable' && product.variants && product.variants.length > 0;

  // Extract distinct color swatches if variable product has color variants
  const colorSwatches = React.useMemo(() => {
    if (!product.variants) return [];
    const colorsMap = new Map<string, { hex: string; name: string }>();
    product.variants.forEach((v) => {
      if (v.color_hex && v.color_name_en) {
        colorsMap.set(v.color_hex, { hex: v.color_hex, name: v.color_name_en });
      }
    });
    return Array.from(colorsMap.values());
  }, [product.variants]);

  const handleDirectOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    if (isVariable) {
      window.location.href = `/product/${product.slug}#order`;
      return;
    }

    // Simple product - add directly and go straight to checkout
    addItem(product, null, 1);
    const checkoutItem = {
      id: `buyNow-${product.id}-0`,
      productId: product.id,
      variantId: null,
      name: product.name_en,
      slug: product.slug,
      sku: product.sku,
      price: product.sale_price || product.regular_price,
      regularPrice: product.regular_price,
      quantity: 1,
      maxStock: product.stock_quantity,
      image: product.main_image,
    };
    try {
      sessionStorage.setItem('roxy_direct_checkout_item', JSON.stringify(checkoutItem));
    } catch {}
    window.location.href = '/checkout?buyNow=1';
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    if (isVariable) {
      // For variable products, direct customer to product detail page to choose exact size/color
      window.location.href = `/product/${product.slug}`;
      return;
    }

    addItem(product, null, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  return (
    <div className="group flex flex-col bg-[#FFFFFF] rounded-lg border border-[#E7E5E4] overflow-hidden luxury-card transition-all duration-300">
      {/* Product Image & Badges */}
      <Link href={`/product/${product.slug}`} className="relative aspect-3/4 bg-[#F5F3EF] overflow-hidden block">
        <img
          src={product.main_image || 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80'}
          alt={product.name_en}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {hasDiscount && (
            <span className="bg-[#631322] text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-sm shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
          {product.is_bestseller && (
            <span className="badge-gold text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-sm shadow-xs">
              Best Seller
            </span>
          )}
          {product.is_new_arrival && !hasDiscount && (
            <span className="bg-[#1C1917] text-white text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-sm shadow-xs">
              New
            </span>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 z-20">
            <span className="bg-white/95 text-[#B91C1C] font-semibold text-xs sm:text-sm px-3 py-1 rounded-sm uppercase tracking-wider">
              স্টক শেষ (Out of Stock)
            </span>
          </div>
        )}
      </Link>

      {/* Product Info Section */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Color Indicators (if available) */}
          {colorSwatches.length > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              {colorSwatches.slice(0, 4).map((c, i) => (
                <span
                  key={i}
                  className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
              {colorSwatches.length > 4 && (
                <span className="text-[10px] text-[#78716C] font-medium">+{colorSwatches.length - 4}</span>
              )}
            </div>
          )}

          {/* Product Title */}
          <Link href={`/product/${product.slug}`} className="block group-hover:text-[#631322] transition-colors">
            <h3 className="text-xs sm:text-sm font-semibold text-[#1C1917] line-clamp-2 leading-snug">
              {product.name_en}
            </h3>
            <p className="text-[11px] sm:text-xs text-[#78716C] line-clamp-1 mt-0.5 font-bengali">
              {product.name_bn}
            </p>
          </Link>
        </div>

        {/* Pricing & Stock Status */}
        <div className="mt-2.5 pt-2 border-t border-[#F5F3EF]">
          <div className="flex items-baseline gap-2">
            <span className="text-sm sm:text-base font-bold text-[#631322]">
              ৳{Number(price).toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-xs text-[#A8A29E] line-through font-normal">
                ৳{Number(product.regular_price).toLocaleString()}
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className={`font-medium ${isOutOfStock ? 'text-[#B91C1C]' : 'text-[#15803D]'}`}>
              {isOutOfStock ? 'স্টক নেই' : 'ইন স্টক'}
            </span>
            <span className="text-[#A8A29E] text-[10px]">COD Available</span>
          </div>

          {/* Action Buttons: ORDER NOW & ADD TO BAG */}
          <div className="mt-3 grid grid-cols-2 gap-1.5 sm:gap-2">
            {/* ORDER NOW: Direct 1-click Order */}
            <button
              onClick={handleDirectOrder}
              disabled={isOutOfStock}
              className="flex items-center justify-center gap-1 py-2 px-1 text-[11px] sm:text-xs font-bold rounded-md bg-[#631322] hover:bg-[#4E0E1A] disabled:bg-[#A8A29E] text-white transition-colors shadow-xs text-center cursor-pointer"
            >
              <span>অর্ডার করুন</span>
              <ArrowRight className="w-3 h-3 hidden sm:inline" />
            </button>

            {/* ADD TO BAG: Instant Bag Add or Size Selection redirect */}
            <button
              onClick={handleQuickAdd}
              disabled={isOutOfStock}
              className={`flex items-center justify-center gap-1 py-2 px-1 text-[11px] sm:text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                addedAnimation
                  ? 'bg-[#15803D] border-[#15803D] text-white'
                  : isOutOfStock
                  ? 'border-[#E7E5E4] text-[#A8A29E] cursor-not-allowed bg-[#F5F3EF]'
                  : 'border-[#631322] text-[#631322] hover:bg-[#631322] hover:text-white bg-white'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>যোগ হয়েছে</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3 h-3" />
                  <span>{isVariable ? 'সাইজ বেছে নিন' : 'কার্টে রাখুন'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
