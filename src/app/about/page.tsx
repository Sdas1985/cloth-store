import React from 'react';
import Link from 'next/link';
import { Sparkles, Heart, Award, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#631322]">
          Our Heritage & Story
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1C1917]">
          রক্সি ফ্যাশন (Roxy Fashion BD)
        </h1>
        <p className="text-sm sm:text-base text-[#57534E] font-bengali leading-relaxed">
          ঐতিহ্য, নিখুঁত কারুকাজ এবং সমসাময়িক আভিজাত্যের বিশ্বস্ত প্রতীক।
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 sm:p-10 shadow-xs space-y-6 text-xs sm:text-sm text-[#57534E] leading-relaxed">
        <p>
          রক্সি ফ্যাশন প্রতিষ্ঠিত হয়েছে বাংলাদেশের সমৃদ্ধ তাঁতশিল্প, সুঁই-সুতোর কারুকাজ এবং ঐতিহ্যবাহী পোশাকের প্রতি গভীর ভালোবাসা থেকে। আমরা বিশ্বাস করি পোশাক শুধু পরার বিষয় নয়—এটি ব্যক্তির রুচি, ব্যক্তিত্ব এবং সংস্কৃতির বহিঃপ্রকাশ।
        </p>
        <p>
          আমাদের প্রতিটি পাঞ্জাবিতে ব্যবহৃত হয় প্রিমিয়াম কোয়ালিটির মিশরীয় গিজা কটন, সিল্ক, জ্যাকার্ড এবং জর্জেট ফেব্রিক। প্রতিটি কলার ও প্ল্যাকেটের এমব্রয়ডারি আমাদের দক্ষ কারিগরদের হাতের নিখুঁত স্পর্শে তৈরি। অন্যদিকে নারীদের থ্রি-পিস ও পোশাকগুলোতে আমরা আধুনিক ফ্যাশন ট্রেন্ডের সাথে দেশীয় নান্দনিকতার অসাধারণ সমন্বয় ঘটাই।
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-[#E7E5E4]">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#FAF9F5] border border-[#E7E5E4] flex items-center justify-center mx-auto text-[#631322]">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-[#1C1917]">মাস্টার ক্রাফটসম্যানশিপ</h4>
            <p className="text-xs text-[#78716C]">নিখুঁত সেলাই ও টেকসই মেটেরিয়াল</p>
          </div>

          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#FAF9F5] border border-[#E7E5E4] flex items-center justify-center mx-auto text-[#631322]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-[#1C1917]">এক্সক্লুসিভ ডিজাইন</h4>
            <p className="text-xs text-[#78716C]">সীমিত সংস্করণের ঐতিহ্যবাহী পোশাক</p>
          </div>

          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#FAF9F5] border border-[#E7E5E4] flex items-center justify-center mx-auto text-[#631322]">
              <Heart className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-[#1C1917]">গ্রাহক সন্তুষ্টি</h4>
            <p className="text-xs text-[#78716C]">নিরাপদ ক্যাশ অন ডেলিভারি</p>
          </div>
        </div>

        <div className="pt-6 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#631322] text-white font-medium rounded-lg hover:bg-[#4E0E1A] transition-colors"
          >
            <span>আমাদের কালেকশন দেখুন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
