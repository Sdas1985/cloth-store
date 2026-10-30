'use client';

import React from 'react';
import { Phone, Mail, MapPin, Clock, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#631322]">
          We Are Here To Help
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917] mt-1">
          যোগাযোগ করুন (Contact Us)
        </h1>
        <p className="text-xs sm:text-sm text-[#57534E] mt-2 font-bengali">
          যেকোনো জিজ্ঞাসা, অর্ডার সহায়তা অথবা সাইজ পরিবর্তনের জন্য আমাদের সাথে যোগাযোগ করুন।
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E7E5E4] p-5 shadow-xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#FAF9F5] border border-[#E7E5E4] flex items-center justify-center text-[#631322] shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#1C1917]">হটলাইন নম্বর</h4>
              <p className="text-xs text-[#57534E] mt-0.5">+880 1762-556262</p>
              <p className="text-[11px] text-[#78716C] mt-1">সকাল ৯টা হতে রাত ১০টা (সপ্তাহে ৭ দিন)</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E7E5E4] p-5 shadow-xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#FAF9F5] border border-[#E7E5E4] flex items-center justify-center text-[#631322] shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#1C1917]">হোয়াটসঅ্যাপ সহায়তা (WhatsApp)</h4>
              <p className="text-xs text-[#57534E] mt-0.5">+880 1762-556262</p>
              <a
                href="https://wa.me/8801762556262"
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-1 text-xs font-semibold text-[#15803D] hover:underline"
              >
                সরাসরি চ্যাট করতে ক্লিক করুন →
              </a>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E7E5E4] p-5 shadow-xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#FAF9F5] border border-[#E7E5E4] flex items-center justify-center text-[#631322] shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#1C1917]">ইমেইল সাপোর্ট</h4>
              <p className="text-xs text-[#57534E] mt-0.5">support@roxyfashion.com</p>
              <p className="text-[11px] text-[#78716C] mt-1">২৪ ঘণ্টার মধ্যে উত্তর প্রদান করা হয়</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E7E5E4] p-5 shadow-xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#FAF9F5] border border-[#E7E5E4] flex items-center justify-center text-[#631322] shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#1C1917]">অফিস ও শো-রুম ঠিকানা</h4>
              <p className="text-xs text-[#57534E] mt-0.5">জিইসি মোড়, চট্টগ্রাম এবং বনানী, ঢাকা, বাংলাদেশ</p>
            </div>
          </div>
        </div>

        {/* Quick Message Form */}
        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-[#1C1917] pb-2 border-b border-[#E7E5E4]">
            সরাসরি বার্তা পাঠান (Leave a Message)
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-[#1C1917] mb-1">আপনার নাম</label>
              <input
                type="text"
                placeholder="Name"
                className="w-full p-2.5 bg-white border border-[#D6D3D1] rounded-md focus:border-[#631322] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1C1917] mb-1">মোবাইল নম্বর</label>
              <input
                type="tel"
                placeholder="01XXXXXXXXX"
                className="w-full p-2.5 bg-white border border-[#D6D3D1] rounded-md focus:border-[#631322] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1C1917] mb-1">আপনার বার্তা</label>
              <textarea
                rows={4}
                placeholder="আপনার বার্তা বা প্রশ্ন লিখুন..."
                className="w-full p-2.5 bg-white border border-[#D6D3D1] rounded-md focus:border-[#631322] focus:outline-hidden"
              />
            </div>
            <button
              type="button"
              onClick={() => alert('আপনার বার্তাটি গ্রহণ করা হয়েছে। ধন্যবাদ!')}
              className="w-full py-3 bg-[#631322] text-white font-semibold rounded-md hover:bg-[#4E0E1A] transition-colors"
            >
              বার্তা পাঠান (Send Message)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
