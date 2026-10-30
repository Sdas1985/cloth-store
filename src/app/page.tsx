import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, Truck, Clock, RefreshCw } from 'lucide-react';
import { getFeaturedProducts, getNewArrivals, getBestSellers, getCategories, getStoreSettings } from '@/lib/products';
import { ProductCard } from '@/components/ProductCard';

export const revalidate = 0; // Ensure fresh data

export default async function HomePage() {
  const [settings, categories, featured, newArrivals, bestSellers] = await Promise.all([
    getStoreSettings(),
    getCategories(),
    getFeaturedProducts(6),
    getNewArrivals(6),
    getBestSellers(6),
  ]);

  return (
    <div className="space-y-12 sm:space-y-20 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative bg-[#1C1917] text-white overflow-hidden">
        {/* Subtle Luxury Pattern Background */}
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#631322]/80 border border-[#D4AF37]/30 text-xs text-[#FAF9F5] tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{settings.banner_headline_bn || 'উৎসব ও ঐতিহ্যের নতুন সমাহার ২০২৬'}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-extrabold tracking-tight leading-tight text-white">
                {settings.banner_headline_en || 'Festive & Traditional Collection 2026'}
              </h1>

              <p className="text-base sm:text-lg text-[#D6D3D1] max-w-xl mx-auto lg:mx-0 font-bengali leading-relaxed">
                {settings.banner_subheadline_bn || 'হাতে তৈরি প্রিমিয়াম পাঞ্জাবি এবং এক্সক্লুসিভ নারী পোশাকের বিশ্বস্ত ঠিকানা। সারাদেশে হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি সুবিধা।'}
              </p>

              {/* Primary Actions: Shop Women & Shop Men */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/category/womens-clothing"
                  className="w-full sm:w-auto px-8 py-4 bg-[#631322] hover:bg-[#7E1A2D] text-white font-medium rounded-md shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base group"
                >
                  <span>Shop Women's Fashion (নারী পোশাক)</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/category/mens-panjabi"
                  className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-white/10 text-white border border-[#D4AF37] font-medium rounded-md transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <span>Shop Men's Panjabi (পাঞ্জাবি)</span>
                </Link>
              </div>

              {/* Trust Callouts */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#A8A29E]">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#D4AF37]" />
                  <span>চট্টগ্রামে মাত্র ৮০৳ | সারাদেশে ১৫০৳</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span>ক্যাশ অন ডেলিভারি (COD)</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visuals */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-3 sm:space-y-4">
                <div className="aspect-3/4 rounded-lg overflow-hidden border border-white/10 shadow-2xl relative">
                  <img
                    src="https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80"
                    alt="Royal Men's Panjabi"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                    <span className="text-xs font-semibold text-white">Men's Panjabi</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4 pt-6 sm:pt-8">
                <div className="aspect-3/4 rounded-lg overflow-hidden border border-white/10 shadow-2xl relative">
                  <img
                    src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80"
                    alt="Designer Women's Wear"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                    <span className="text-xs font-semibold text-white">Women's Collection</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <span className="text-xs uppercase tracking-widest text-[#631322] font-bold">Featured Collections</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917] mt-1">
            পছন্দের ক্যাটাগরি বেছে নিন
          </h2>
          <p className="text-xs sm:text-sm text-[#57534E] mt-1">
            Explore carefully curated wardrobes designed for festive joy and refined everyday elegance.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group relative h-48 sm:h-72 md:h-96 rounded-xl overflow-hidden border border-[#E7E5E4] shadow-md flex items-end"
            >
              <img
                src={cat.image_url || 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80'}
                alt={cat.name_en}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/90 via-[#1C1917]/40 to-transparent" />

              <div className="relative p-3 sm:p-6 md:p-8 w-full flex items-end justify-between gap-1">
                <div className="min-w-0">
                  <span className="text-[10px] sm:text-xs font-semibold text-[#D4AF37] uppercase tracking-wider block truncate">
                    {cat.slug === 'mens-panjabi' ? "Men's Heritage" : "Women's Luxury"}
                  </span>
                  <h3 className="text-sm sm:text-2xl font-serif font-bold text-white mt-0.5 sm:mt-1 truncate">
                    {cat.name_en}
                  </h3>
                  <p className="text-[11px] sm:text-sm text-[#D6D3D1] font-bengali mt-0.5 truncate">
                    {cat.name_bn}
                  </p>
                </div>

                <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-[#631322] transition-colors shrink-0">
                  <ArrowRight className="w-3.5 h-3.5 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS (Mobile: 2 per row) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 pb-3 border-b border-[#E7E5E4] gap-2">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#631322] font-bold">Curated Picks</span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1C1917] mt-0.5">
              স্পেশাল ফিচারড কালেকশন (Featured)
            </h2>
          </div>
          <Link
            href="/products?filter=featured"
            className="text-xs sm:text-sm font-semibold text-[#631322] hover:text-[#4E0E1A] flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 2 items per row on mobile, 3 on md, 4 on lg */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. MID-PAGE PROMOTIONAL LUXURY BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl bg-[#631322] text-white p-6 sm:p-12 lg:p-16 overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-block text-xs uppercase tracking-widest text-[#D4AF37] font-bold">
              Special Festive Offer
            </span>
            <h3 className="text-2xl sm:text-4xl font-serif font-bold">
              ৩,০০০ টাকার কেনাকাটায় পাচ্ছেন সম্পূর্ণ ফ্রি হোম ডেলিভারি!
            </h3>
            <p className="text-xs sm:text-sm text-[#FAF9F5]/90 font-bengali leading-relaxed">
              সরাসরি কারখানা ও মাস্টার কারিগরদের থেকে তৈরি প্রিমিয়াম পোশাক এখন ঘরে বসেই সংগ্রহ করুন। পণ্য হাতে পেয়ে সম্পূর্ণ দেখে মূল্য পরিশোধের শতভাগ নিশ্চয়তা।
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#FAF9F5] text-[#631322] hover:bg-white font-semibold text-xs sm:text-sm rounded-md shadow-md transition-colors"
              >
                <span>অর্ডার করতে ক্লিক করুন (Shop All)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. NEW ARRIVALS (Mobile: 2 per row) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 pb-3 border-b border-[#E7E5E4] gap-2">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#631322] font-bold">Just Dropped</span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1C1917] mt-0.5">
              নতুন কালেকশন (New Arrivals)
            </h2>
          </div>
          <Link
            href="/products?filter=new"
            className="text-xs sm:text-sm font-semibold text-[#631322] hover:text-[#4E0E1A] flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. BANGLADESH DELIVERY & TRUST PROMISE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-10 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-[#E7E5E4]">
            <div className="flex items-start gap-4 pt-4 md:pt-0">
              <div className="w-12 h-12 rounded-xl bg-[#FAF9F5] border border-[#E7E5E4] flex items-center justify-center text-[#631322] shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#1C1917]">সমগ্র বাংলাদেশে ডেলিভারি</h4>
                <p className="text-xs sm:text-sm text-[#57534E] mt-1 font-bengali">
                  চট্টগ্রাম জেলায় ৮০ টাকা এবং দেশের বাকি ৬৩টি জেলায় ১৫০ টাকায় দ্রুততম কুরিয়ার ডেলিভারি।
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 pt-6 md:pt-0 md:pl-8">
              <div className="w-12 h-12 rounded-xl bg-[#FAF9F5] border border-[#E7E5E4] flex items-center justify-center text-[#631322] shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#1C1917]">ক্যাশ অন ডেলিভারি (COD)</h4>
                <p className="text-xs sm:text-sm text-[#57534E] mt-1 font-bengali">
                  কোনো অগ্রিম পেমেন্ট ছাড়াই অর্ডার করুন। পার্সেল হাতে পেয়ে ডেলিভারিম্যানের সামনে দেখে মূল্য দিন।
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 pt-6 md:pt-0 md:pl-8">
              <div className="w-12 h-12 rounded-xl bg-[#FAF9F5] border border-[#E7E5E4] flex items-center justify-center text-[#631322] shrink-0">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#1C1917]">সহজ সাইজ এক্সচেঞ্জ পলিসি</h4>
                <p className="text-xs sm:text-sm text-[#57534E] mt-1 font-bengali">
                  সাইজে সমস্যা হলে ৪৮ ঘণ্টার মধ্যে আমাদের হটলাইনে কল করলেই দ্রুত এক্সচেঞ্জ সুবিধা পাবেন।
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
