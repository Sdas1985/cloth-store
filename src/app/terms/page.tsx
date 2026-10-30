import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="mb-8 pb-4 border-b border-[#E7E5E4]">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917]">
          Terms & Conditions (শর্তাবলী)
        </h1>
        <p className="text-xs sm:text-sm text-[#57534E] mt-1 font-bengali">
          রক্সি ফ্যাশন প্ল্যাটফর্ম ব্যবহারের নিয়ম ও শর্তসমূহ
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 sm:p-10 shadow-xs space-y-6 text-xs sm:text-sm text-[#57534E] leading-relaxed">
        <div>
          <h3 className="font-bold text-base text-[#1C1917] mb-2">১. অর্ডার গ্রহণ ও মূল্য পরিশোধ</h3>
          <p>
            রক্সি ফ্যাশনের সকল পণ্য ক্যাশ অন ডেলিভারি (COD) পদ্ধতিতে বিক্রয় করা হয়। গ্রাহক পার্সেল গ্রহণ করার সময় নির্ধারিত সম্পূর্ণ মূল্য (প্রোডাক্ট মূল্য + প্রযোজ্য ডেলিভারি চার্জ) ডেলিভারি প্রতিনিধিকে পরিশোধ করতে বাধ্য থাকিবেন।
          </p>
        </div>

        <div>
          <h3 className="font-bold text-base text-[#1C1917] mb-2">২. ডেলিভারি সময়সীমা ও চার্জ</h3>
          <p>
            চট্টগ্রাম জেলায় ডেলিভারি চার্জ ৮০ টাকা এবং দেশের অবশিষ্ট ৬৩টি জেলায় ১৫০ টাকা। পণ্য পাঠানোর পর কাস্টমার সার্ভিসের মাধ্যমে ট্র্যাকিং রেফারেন্স প্রদান করা হয়। প্রতিকূল আবহাওয়া বা জাতীয় ছুটির কারণে ডেলিভারি বিলম্বিত হতে পারে।
          </p>
        </div>

        <div>
          <h3 className="font-bold text-base text-[#1C1917] mb-2">৩. রিটার্ন ও সাইজ পরিবর্তন</h3>
          <p>
            সাইজ পরিবর্তনের ক্ষেত্রে পার্সেল গ্রহণের ৪৮ ঘণ্টার মধ্যে অবহিত করতে হবে। পোশাকটি অবশ্যই নতুন এবং অব্যবহৃত থাকতে হবে।
          </p>
        </div>
      </div>
    </div>
  );
}
