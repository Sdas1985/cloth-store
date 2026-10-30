'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Search, Menu, X, Phone, Truck, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function Navbar() {
  const pathname = usePathname();
  const { itemCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // If inside /admin, don't show the storefront navbar
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
  };

  const navLinks = [
    { titleBn: 'হোম', titleEn: 'Home', href: '/' },
    { titleBn: 'নারী কালেকশন', titleEn: "Women's", href: '/category/womens-clothing' },
    { titleBn: 'পাঞ্জাবি', titleEn: "Men's Panjabi", href: '/category/mens-panjabi' },
    { titleBn: 'সব কালেকশন', titleEn: 'All Products', href: '/products' },
    { titleBn: 'অর্ডার ট্র্যাকিং', titleEn: 'Track Order', href: '/track' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E7E5E4] shadow-xs transition-all">
      {/* Top Banner */}
      <div className="bg-[#631322] text-[#FAF9F5] text-[11px] sm:text-xs py-2 px-4 text-center tracking-wide font-medium flex items-center justify-center gap-3 sm:gap-6">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping" />
          ✨ উৎসব ও ঐতিহ্যের নতুন কালেকশন ২০২৬
        </span>
        <span className="hidden md:inline text-white/40">•</span>
        <span className="hidden md:inline">🚚 চট্টগ্রামে ৮০৳ | সারাদেশে ১৫০৳ ক্যাশ অন ডেলিভারি</span>
        <span className="hidden lg:inline text-white/40">•</span>
        <a
          href="tel:+8801762556262"
          className="hidden lg:inline-flex items-center gap-1 text-[#D4AF37] hover:underline font-semibold"
        >
          <Phone className="w-3 h-3" />
          ০১৭৬২-৫৫৬২৬২
        </a>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu trigger & Mobile Search */}
          <div className="flex items-center gap-1 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 text-[#1C1917] hover:text-[#631322] rounded-lg hover:bg-[#FAF9F5] transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-[#1C1917] hover:text-[#631322] rounded-lg hover:bg-[#FAF9F5] transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Logo & Brand Identity */}
          <div className="flex-1 lg:flex-none text-center lg:text-left">
            <Link href="/" className="inline-block group py-1">
              <span className="font-serif text-2xl sm:text-3xl font-black tracking-[0.2em] text-[#1C1917] group-hover:text-[#631322] transition-colors">
                ROXY
              </span>
              <span className="block text-[8px] sm:text-[9px] tracking-[0.35em] text-[#631322] font-bold uppercase -mt-0.5">
                Fashion • Bangladesh
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative px-3.5 py-2 rounded-lg flex flex-col items-center transition-all duration-200 ${
                    isActive
                      ? 'text-[#631322] bg-[#FAF9F5]'
                      : 'text-[#292524] hover:text-[#631322] hover:bg-[#FAF9F5]'
                  }`}
                >
                  <span className="text-[13px] font-semibold tracking-wide">
                    {link.titleBn}
                  </span>
                  <span
                    className={`text-[9px] tracking-widest uppercase transition-colors -mt-0.5 ${
                      isActive
                        ? 'text-[#631322] font-bold'
                        : 'text-[#78716C] group-hover:text-[#631322]'
                    }`}
                  >
                    {link.titleEn}
                  </span>
                  {/* Subtle active indicator bar */}
                  {isActive && (
                    <span className="absolute bottom-1 w-6 h-0.5 bg-[#631322] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Desktop Quick Search Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="hidden lg:flex items-center gap-2.5 text-xs text-[#57534E] hover:text-[#631322] px-3.5 py-2 rounded-full bg-[#FAF9F5] border border-[#E7E5E4] hover:border-[#631322]/40 transition-all shadow-2xs"
            >
              <Search className="w-3.5 h-3.5 text-[#78716C]" />
              <span className="text-xs">পোশাক খুঁজুন...</span>
            </button>

            {/* Quick Call hotline button */}
            <a
              href="tel:+8801762556262"
              className="hidden md:flex items-center gap-2 text-xs font-bold text-[#1C1917] hover:text-[#631322] px-3 py-1.5 rounded-full border border-transparent hover:border-[#E7E5E4] transition-all"
              title="Call Roxy Hotline"
            >
              <div className="w-6 h-6 rounded-full bg-[#631322]/10 flex items-center justify-center text-[#631322]">
                <Phone className="w-3 h-3" />
              </div>
              <span className="tracking-tight">01762-556262</span>
            </a>

            {/* Shopping Bag Button with Counter */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-[#1C1917] hover:text-[#631322] rounded-full hover:bg-[#FAF9F5] border border-transparent hover:border-[#E7E5E4] transition-all cursor-pointer"
              aria-label="Shopping bag"
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              {itemCount > 0 ? (
                <span className="absolute top-1 right-1 bg-[#631322] text-white text-[10px] font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                  {itemCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        {/* Expandable Search Input */}
        {searchOpen && (
          <div className="py-3 border-t border-[#E7E5E4] animate-fadeIn">
            <form onSubmit={handleSearchSubmit} className="relative max-w-xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="পাঞ্জাবি, থ্রি-পিস অথবা প্রোডাক্ট খুঁজুন (e.g. Panjabi, Jamdani, Silk)..."
                autoFocus
                className="w-full bg-[#FAF9F5] border border-[#D6D3D1] focus:border-[#631322] rounded-lg py-2.5 pl-10 pr-24 text-sm focus:outline-hidden text-[#1C1917]"
              />
              <Search className="w-4 h-4 text-[#78716C] absolute left-3.5 top-3.5" />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bg-[#631322] hover:bg-[#4E0E1A] text-white text-xs px-4 py-1.5 rounded-md font-semibold transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E7E5E4] bg-[#FFFFFF] px-4 pt-3 pb-6 space-y-3 shadow-lg animate-fadeIn">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-[#FAF9F5] text-[#631322] font-bold border-l-4 border-[#631322]'
                      : 'text-[#1C1917] hover:bg-[#FAF9F5] hover:text-[#631322]'
                  }`}
                >
                  <span className="font-semibold">{link.titleBn}</span>
                  <span className="text-xs uppercase tracking-wider text-[#78716C]">{link.titleEn}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#E7E5E4] space-y-2 text-xs text-[#57534E]">
            <div className="flex items-center gap-2 text-[#1C1917] font-medium py-1">
              <Truck className="w-4 h-4 text-[#631322]" />
              <span>ক্যাশ অন ডেলিভারি (Cash on Delivery) সারাদেশে</span>
            </div>
            <div className="flex items-center gap-2 text-[#1C1917] font-medium py-1">
              <ShieldCheck className="w-4 h-4 text-[#631322]" />
              <span>১০০% আসল ও প্রিমিয়াম কাপড়ের পোশাক</span>
            </div>
            <div className="pt-2">
              <a
                href="tel:+8801762556262"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#FAF9F5] border border-[#E7E5E4] rounded-lg text-[#631322] font-bold"
              >
                <Phone className="w-4 h-4" />
                <span>হটলাইন: 01762-556262</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
