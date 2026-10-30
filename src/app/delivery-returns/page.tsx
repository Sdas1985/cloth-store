import React from 'react';
import Link from 'next/link';
import { Truck, RefreshCw, ShieldCheck, HelpCircle } from 'lucide-react';

export default function DeliveryReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="mb-8 pb-4 border-b border-[#E7E5E4]">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917]">
          Delivery & Return Policy (ডেলিভারি ও রিটার্ন পলিসি)
        </h1>
        <p className="text-xs sm:text-sm text-[#57534E] mt-1 font-bengali">
          রক্সি ফ্যাশনের গ্রাহকবান্ধব ডেলিভারি এবং সহজ এক্সচেঞ্জ নীতিমালা
        </p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-[#57534E] leading-relaxed">
        {/* Delivery Rates */}
        <div className="bg-white rounded-xl border border-[#E7E5E4] p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-[#1C1917] font-bold text-base">
            <Truck className="w-5 h-5 text-[#631322]" />
            <span>ডেলিভারি চার্জ এবং সময়সীমা (Delivery Rates & Time)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-[#FAF9F5] border border-[#E7E5E4]">
              <h4 className="font-bold text-[#1C1917]">চট্টগ্রাম জেলা (Chattogram District)</h4>
              <p className="mt-1 text-xs">
                • ডেলিভারি চার্জ: <strong className="text-[#631322]">৮০ টাকা</strong><br />
                • সময়সীমা: ২৪ থেকে ৪৮ ঘণ্টার মধ্যে<br />
                • মেট্রোপলিটন এলাকা ও উপজেলাসমূহ
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#FAF9F5] border border-[#E7E5E4]">
              <h4 className="font-bold text-[#1C1917]">সমগ্র বাংলাদেশ (Other 63 Districts)</h4>
              <p className="mt-1 text-xs">
                • ডেলিভারি চার্জ: <strong className="text-[#631322]">১৫০ টাকা</strong><br />
                • সময়সীমা: ২ থেকে ৪ কার্যদিবস<br />
                • ঢাকা, সিলেট, রাজশাহী, খুলনা সহ সকল জেলায়
              </p>
            </div>
          </div>

          <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-md text-xs text-[#15803D]">
            🎉 <strong>ফ্রি ডেলিভারি অফার:</strong> যেকোনো অর্ডারের মোট মূল্য ৩,০০০ টাকা বা তার বেশি হলে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!
          </div>
        </div>

        {/* COD Policy */}
        <div className="bg-white rounded-xl border border-[#E7E5E4] p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-[#1C1917] font-bold text-base">
            <ShieldCheck className="w-5 h-5 text-[#631322]" />
            <span>ক্যাশ অন ডেলিভারি (Cash on Delivery) গ্যারান্টি</span>
          </div>
          <p>
            আমরা গ্রাহকদের শতভাগ আস্থার নিশ্চয়তা দিতে ক্যাশ অন ডেলিভারি সুবিধা প্রদান করি। ডেলিভারিম্যান পার্সেল নিয়ে পৌঁছালে আপনি প্যাকেটটি খুলে প্রোডাক্ট ও সাইজ দেখে নিশ্চিত হয়ে মূল্য পরিশোধ করতে পারবেন। কোনো প্রকার অগ্রিম পেমেন্টের প্রয়োজন নেই।
          </p>
        </div>

        {/* Exchange Policy */}
        <div className="bg-white rounded-xl border border-[#E7E5E4] p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-[#1C1917] font-bold text-base">
            <RefreshCw className="w-5 h-5 text-[#631322]" />
            <span>সাইজ পরিবর্তন ও রিটার্ন পলিসি (Easy Exchange)</span>
          </div>
          <p>
            যদি পোশাকের সাইজে কোনো অমিল হয় অথবা ভুল সাইজ ডেলিভারি হয়ে থাকে, তবে পার্সেল পাওয়ার <strong>৪৮ ঘণ্টার মধ্যে</strong> আমাদের কাস্টমার সার্ভিসে জানান।
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs">
            <li>পোশাকটি অব্যবহৃত, অপ্রক্ষালিত (unwashed) এবং অরিজিনাল ট্যাগ সহ থাকতে হবে।</li>
            <li>আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করে নতুন সাইজ পাঠিয়ে আগেরটি পিকআপ করবেন।</li>
            <li>সাইজ পরিবর্তনের ক্ষেত্রে শুধুমাত্র কুরিয়ার চার্জ প্রযোজ্য হবে।</li>
          </ul>
        </div>

        {/* Contact info */}
        <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#E7E5E4] text-xs">
          যেকোনো সহায়তায় আমাদের হটলাইনে কল করুন: <strong className="text-[#631322]">+880 1762-556262</strong> (সকাল ৯টা - রাত ১০টা)
        </div>
      </div>
    </div>
  );
}
