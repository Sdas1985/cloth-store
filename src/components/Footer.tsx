'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Mail, MapPin, Truck, ShieldCheck, RefreshCw, Lock } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();

  // Hide on admin routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-[#1C1917] text-[#FAF9F5] border-t border-[#292524] mt-auto">
      {/* Trust Badges Bar */}
      <div className="border-b border-[#292524] py-8 bg-[#161413]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-4 p-2">
              <div className="w-12 h-12 rounded-full bg-[#292524] flex items-center justify-center text-[#D4AF37] shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Cash on Delivery</h4>
                <p className="text-xs text-[#A8A29E] mt-0.5">সারাদেশে পণ্য দেখে মূল্য পরিশোধ</p>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-4 p-2">
              <div className="w-12 h-12 rounded-full bg-[#292524] flex items-center justify-center text-[#D4AF37] shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">100% Premium Quality</h4>
                <p className="text-xs text-[#A8A29E] mt-0.5">সেরা সুতা ও নিখুঁত ফিনিশিং</p>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-4 p-2">
              <div className="w-12 h-12 rounded-full bg-[#292524] flex items-center justify-center text-[#D4AF37] shrink-0">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Easy Exchange Policy</h4>
                <p className="text-xs text-[#A8A29E] mt-0.5">সাইজ পরিবর্তনের সহজ সুবিধা</p>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-4 p-2">
              <div className="w-12 h-12 rounded-full bg-[#292524] flex items-center justify-center text-[#D4AF37] shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Customer Support</h4>
                <p className="text-xs text-[#A8A29E] mt-0.5">সকাল ৯টা হতে রাত ১০টা পর্যন্ত</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-serif text-3xl font-extrabold tracking-widest text-[#FAF9F5]">
                ROXY
              </span>
              <span className="block text-[10px] tracking-[0.25em] text-[#D4AF37] font-semibold uppercase -mt-1">
                Fashion • Bangladesh
              </span>
            </Link>
            <p className="text-sm text-[#A8A29E] leading-relaxed max-w-sm">
              রক্সি ফ্যাশন সমসাময়িক ট্রেন্ড ও ঐতিহ্যবাহী রুচিশীলতার এক মেলবন্ধন। পুরুষদের হাতে তৈরি প্রিমিয়াম পাঞ্জাবি ও নারীদের এক্সক্লুসিভ পোশাক পৌঁছে দিচ্ছি সমগ্র বাংলাদেশে।
            </p>
            <div className="pt-2 text-xs text-[#78716C] space-y-1">
              <p>Registered Office: GEC Circle, Chattogram, Bangladesh</p>
              <p>Hotline: +880 1762-556262 | Email: support@roxyfashion.com</p>
            </div>
          </div>

          {/* Quick Collections */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Collections
            </h3>
            <ul className="space-y-2.5 text-sm text-[#A8A29E]">
              <li>
                <Link href="/category/womens-clothing" className="hover:text-[#D4AF37] transition-colors">
                  Women's Collection (নারী পোশাক)
                </Link>
              </li>
              <li>
                <Link href="/category/mens-panjabi" className="hover:text-[#D4AF37] transition-colors">
                  Men's Panjabi (পাঞ্জাবি)
                </Link>
              </li>
              <li>
                <Link href="/products?filter=new" className="hover:text-[#D4AF37] transition-colors">
                  New Arrivals (নতুন সমাহার)
                </Link>
              </li>
              <li>
                <Link href="/products?filter=bestseller" className="hover:text-[#D4AF37] transition-colors">
                  Best Sellers (জনপ্রিয় পণ্য)
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-[#D4AF37] transition-colors">
                  All Collections
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service & Policies */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Customer Care
            </h3>
            <ul className="space-y-2.5 text-sm text-[#A8A29E]">
              <li>
                <Link href="/track" className="hover:text-[#D4AF37] transition-colors">
                  Track Your Order (অর্ডার ট্র্যাক)
                </Link>
              </li>
              <li>
                <Link href="/delivery-returns" className="hover:text-[#D4AF37] transition-colors">
                  Delivery & Return Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-[#D4AF37] transition-colors">
                  Privacy Policy (গোপনীয়তা নীতি)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#D4AF37] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#D4AF37] transition-colors">
                  Contact Us (যোগাযোগ)
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct Support */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Help & Hotline
            </h3>
            <div className="space-y-3 text-sm text-[#A8A29E]">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-white">+880 1762-556262</div>
                  <div className="text-xs text-[#78716C]">সকাল ৯টা - রাত ১০টা (প্রতিদিন)</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                <span className="text-xs">support@roxyfashion.com</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                <span className="text-xs">জিইসি মোড়, চট্টগ্রাম এবং বনানী, ঢাকা</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#292524] mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#78716C] gap-4">
          <p>© {new Date().getFullYear()} Roxy Fashion BD. All rights reserved. Crafted for Bangladesh.</p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-white transition-colors">
              About Us
            </Link>
            <span>•</span>
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/admin/login" className="flex items-center gap-1 hover:text-[#D4AF37] transition-colors">
              <Lock className="w-3 h-3" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
