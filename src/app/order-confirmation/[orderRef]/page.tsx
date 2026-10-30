import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Package } from 'lucide-react';
import { getOrderByRef } from '../../../../server/storeRepo';

export const revalidate = 0;

interface OrderConfirmationPageProps {
  params: Promise<{
    orderRef: string;
  }>;
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { orderRef } = await params;

  const order = await getOrderByRef(orderRef);

  if (!order) {
    notFound();
  }

  const items = order.items || [];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Success Card */}
      <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 sm:p-10 shadow-lg text-center space-y-6">
        <div className="w-16 h-16 bg-[#F0FDF4] border border-[#BBF7D0] rounded-full flex items-center justify-center mx-auto text-[#15803D]">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-semibold text-[#15803D] uppercase tracking-wider bg-[#F0FDF4] px-3 py-1 rounded-full border border-[#BBF7D0]">
            অর্ডার সফল হয়েছে (Order Placed Successfully)
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917] mt-3">
            ধন্যবাদ, {order.customer_name}!
          </h1>
          <p className="text-sm sm:text-base text-[#57534E] font-bengali mt-2 max-w-lg mx-auto leading-relaxed">
            আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। আমাদের কাস্টমার প্রতিনিধি শীঘ্রই আপনার সঙ্গে যোগাযোগ করবেন।
          </p>
        </div>

        {/* Public Reference Badge */}
        <div className="bg-[#FAF9F5] border border-[#E7E5E4] rounded-xl p-4 max-w-md mx-auto">
          <div className="text-xs text-[#78716C] uppercase tracking-wider font-semibold">
            Order Reference Number (ট্র্যাকিং নম্বর)
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-[#631322] mt-1 tracking-wider">
            {order.public_reference}
          </div>
          <div className="text-[11px] text-[#57534E] mt-1">
            এই রেফারেন্স নম্বরটি সংরক্ষণ করুন
          </div>
        </div>

        {/* Delivery & Payment Information */}
        <div className="text-left border-t border-b border-[#E7E5E4] py-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div>
            <h4 className="font-bold text-[#1C1917] mb-1">ডেলিভারি ঠিকানা (Delivery Address)</h4>
            <p className="text-[#57534E]">
              {order.customer_name}<br />
              {order.customer_phone}<br />
              {order.delivery_address}<br />
              জেলা: {order.district_name}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-[#1C1917] mb-1">পেমেন্ট মেথড (Payment Info)</h4>
            <p className="text-[#57534E]">
              ক্যাশ অন ডেলিভারি (Cash on Delivery)<br />
              পার্সেল হাতে পেয়ে পরিশোধযোগ্য: <strong className="text-[#631322] text-base">৳{Number(order.total_amount).toLocaleString()}</strong><br />
              স্ট্যাটাস: <span className="font-semibold text-[#B45309]">পেন্ডিং (Pending Confirmation)</span>
            </p>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="text-left space-y-3">
          <h4 className="font-bold text-sm text-[#1C1917]">অর্ডারকৃত আইটেম (Ordered Items)</h4>
          <div className="divide-y divide-[#F5F3EF] border rounded-lg overflow-hidden">
            {items.map((item, idx) => (
              <div key={idx} className="p-3 bg-white flex justify-between items-center text-xs">
                <div>
                  <div className="font-semibold text-[#1C1917]">{item.productName}</div>
                  <div className="text-[#78716C]">{item.variantDetails} • Qty: {item.quantity}</div>
                </div>
                <div className="font-bold text-[#631322]">
                  ৳{Number(item.totalPrice).toLocaleString()}
                </div>
              </div>
            ))}
            <div className="p-3 bg-[#FAF9F5] flex justify-between items-center text-xs font-semibold">
              <span>ডেলিভারি চার্জ ({order.district_name})</span>
              <span>৳{Number(order.delivery_charge).toLocaleString()}</span>
            </div>
            <div className="p-3 bg-[#FAF9F5] flex justify-between items-center text-sm font-bold border-t">
              <span>সর্বমোট প্রদেয় (Total Payable on COD)</span>
              <span className="text-[#631322] text-base">৳{Number(order.total_amount).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`/track?ref=${encodeURIComponent(order.public_reference)}`}
            className="w-full sm:w-auto px-6 py-3 bg-[#631322] text-white font-medium text-xs sm:text-sm rounded-lg hover:bg-[#4E0E1A] transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Package className="w-4 h-4" />
            <span>Track Order (অর্ডার ট্র্যাক করুন)</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 bg-[#F5F3EF] text-[#1C1917] font-medium text-xs sm:text-sm rounded-lg hover:bg-[#E7E5E4] transition-colors"
          >
            Continue Shopping (হোম পেজে ফিরুন)
          </Link>
        </div>

        <div className="text-xs text-[#78716C] pt-2">
          যেকোনো প্রয়োজনে আমাদের কাস্টমার সার্ভিসে যোগাযোগ করুন: <strong>+880 1762-556262</strong>
        </div>
      </div>
    </div>
  );
}
