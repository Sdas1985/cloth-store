'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Eye,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  Printer,
  ShieldAlert,
  UserX,
  UserCheck,
  AlertCircle,
  X,
  Phone,
  Calendar,
} from 'lucide-react';
import { Order, OrderItem } from '@/lib/types';

interface OrdersClientProps {
  initialOrders: Order[];
  allStaff: Array<{ id: number; name: string }>;
}

export function OrdersClient({ initialOrders, allStaff }: OrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');

  // Selected Order for Modal View
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerHistory, setCustomerHistory] = useState<any>(null);
  const [relatedOrders, setRelatedOrders] = useState<Order[]>([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Status Change State
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newFulfillment, setNewFulfillment] = useState('');
  const [newPayment, setNewPayment] = useState('');
  const [staffNotes, setStaffNotes] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Block Modal State
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [blockLoading, setBlockLoading] = useState(false);

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      !search ||
      o.public_reference.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone.includes(search) ||
      o.district_name.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'all' || o.fulfillment_status === statusFilter;
    const matchRisk = riskFilter === 'all' || o.risk_level === riskFilter;

    return matchSearch && matchStatus && matchRisk;
  });

  // Open Order Details Modal
  const openOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    setNewFulfillment(order.fulfillment_status);
    setNewPayment(order.payment_status);
    setStaffNotes(order.staff_notes || '');
    setStatusMessage('');
    setLoadingDetails(true);

    try {
      const res = await fetch(`/api/admin/orders/${order.id}/details`);
      if (res.ok) {
        const data = await res.json();
        setOrderItems(data.items || []);
        setCustomerHistory(data.customer || null);
        setRelatedOrders(data.relatedOrders || []);
        setIsBlocked(Boolean(data.isBlocked));
      }
    } catch (err) {
      console.error('Failed to load order details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Save Status Updates
  const handleSaveStatus = async () => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    setStatusMessage('');

    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fulfillmentStatus: newFulfillment,
          paymentStatus: newPayment,
          staffNotes,
        }),
      });

      if (res.ok) {
        setStatusMessage('অর্ডার স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে!');
        setOrders((prev) =>
          prev.map((o) =>
            o.id === selectedOrder.id
              ? {
                  ...o,
                  fulfillment_status: newFulfillment as any,
                  payment_status: newPayment as any,
                  staff_notes: staffNotes,
                }
              : o
          )
        );
      } else {
        setStatusMessage('স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      setStatusMessage('সার্ভার ত্রুটি।');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Block Customer
  const handleBlockCustomer = async () => {
    if (!selectedOrder || !blockReason.trim()) return;
    setBlockLoading(true);

    try {
      const res = await fetch('/api/admin/fraud/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: selectedOrder.customer_phone,
          reason: blockReason.trim(),
        }),
      });

      if (res.ok) {
        setIsBlocked(true);
        setBlockModalOpen(false);
        setBlockReason('');
        alert('গ্রাহক নম্বরটি সফলভাবে ব্লক করা হয়েছে। নতুন কোনো অর্ডার করতে পারবে না।');
      }
    } catch (err) {
      alert('ব্লক করতে সমস্যা হয়েছে।');
    } finally {
      setBlockLoading(false);
    }
  };

  // Unblock Customer
  const handleUnblockCustomer = async () => {
    if (!selectedOrder) return;
    if (!confirm('আপনি কি এই গ্রাহককে আনব্লক করতে চান?')) return;

    try {
      const res = await fetch('/api/admin/fraud/unblock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: selectedOrder.customer_phone }),
      });

      if (res.ok) {
        setIsBlocked(false);
        alert('গ্রাহককে সফলভাবে আনব্লক করা হয়েছে।');
      }
    } catch (err) {
      alert('আনব্লক করতে সমস্যা হয়েছে।');
    }
  };

  const printInvoice = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E5E4]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917]">
            Order Management (অর্ডার ব্যবস্থাপনা)
          </h1>
          <p className="text-xs sm:text-sm text-[#57534E] mt-0.5">
            Real-time COD orders, fulfillment workflows, and customer fraud review
          </p>
        </div>

        <div className="text-xs font-semibold bg-white border border-[#E7E5E4] px-4 py-2 rounded-lg">
          Total Found: <strong className="text-[#631322]">{filteredOrders.length}</strong>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E5E4] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="রেফারেন্স, নাম বা মোবাইল দিয়ে খুঁজুন..."
            className="w-full py-2 pl-9 pr-3 bg-[#FAF9F5] border border-[#D6D3D1] rounded-lg text-xs focus:outline-hidden focus:border-[#631322]"
          />
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 bg-[#FAF9F5] border border-[#D6D3D1] rounded-lg text-xs"
          >
            <option value="all">All Statuses (সকল স্ট্যাটাস)</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="returned">Returned</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="py-2 px-3 bg-[#FAF9F5] border border-[#D6D3D1] rounded-lg text-xs"
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low Risk</option>
            <option value="high">High Risk (Fraud Check)</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-[#E7E5E4] shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#78716C]">
            কোনো অর্ডার পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF9F5] border-b border-[#E7E5E4] text-[#1C1917]">
                  <th className="p-3.5 font-bold">Reference</th>
                  <th className="p-3.5 font-bold">Date</th>
                  <th className="p-3.5 font-bold">Customer Name</th>
                  <th className="p-3.5 font-bold">Mobile Phone</th>
                  <th className="p-3.5 font-bold">District</th>
                  <th className="p-3.5 font-bold">Amount</th>
                  <th className="p-3.5 font-bold">Payment</th>
                  <th className="p-3.5 font-bold">Fulfillment</th>
                  <th className="p-3.5 font-bold">Risk Flag</th>
                  <th className="p-3.5 font-bold text-center">View / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4]">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FAF9F5] transition-colors">
                    <td className="p-3.5 font-mono font-bold text-[#631322]">
                      {ord.public_reference}
                    </td>
                    <td className="p-3.5 text-[#57534E] whitespace-nowrap">
                      {new Date(ord.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 font-semibold text-[#1C1917]">{ord.customer_name}</td>
                    <td className="p-3.5 font-mono text-[#57534E]">{ord.customer_phone}</td>
                    <td className="p-3.5 text-[#57534E]">{ord.district_name}</td>
                    <td className="p-3.5 font-bold text-[#1C1917]">
                      ৳{Number(ord.total_amount).toLocaleString()}
                    </td>
                    <td className="p-3.5">
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-[#FAF9F5] border border-[#E7E5E4] rounded-md">
                        {ord.payment_status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.fulfillment_status === 'delivered'
                            ? 'bg-[#F0FDF4] text-[#15803D]'
                            : ord.fulfillment_status === 'cancelled'
                            ? 'bg-[#FEF2F2] text-[#B91C1C]'
                            : ord.fulfillment_status === 'confirmed'
                            ? 'bg-[#EFF6FF] text-[#1D4ED8]'
                            : 'bg-[#FFFBEB] text-[#B45309]'
                        }`}
                      >
                        {ord.fulfillment_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${
                          ord.risk_level === 'high'
                            ? 'bg-[#FEF2F2] text-[#B91C1C]'
                            : 'bg-[#F0FDF4] text-[#15803D]'
                        }`}
                      >
                        {ord.risk_level.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      {/* DEDICATED EYE VIEW ACTION ICON AS REQUIRED */}
                      <button
                        onClick={() => openOrderDetails(ord)}
                        className="p-2 bg-[#F5F3EF] hover:bg-[#631322] hover:text-white text-[#631322] rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title="View Full Order & Customer Fraud History"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="font-semibold text-[11px]">View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAILED VIEW ORDER MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-[#E7E5E4] shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E7E5E4]">
              <div>
                <span className="text-xs text-[#78716C] font-semibold">ORDER DETAILS</span>
                <h2 className="text-xl sm:text-2xl font-mono font-bold text-[#631322]">
                  {selectedOrder.public_reference}
                </h2>
                <div className="text-xs text-[#57534E] mt-0.5">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={printInvoice}
                  className="px-3 py-1.5 bg-[#FAF9F5] border border-[#D6D3D1] hover:border-[#631322] text-[#1C1917] rounded-md text-xs font-semibold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-[#78716C] hover:text-[#1C1917] rounded-full hover:bg-[#F5F3EF]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Block Alert Banner if Phone is Blocked */}
            {isBlocked && (
              <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-xs text-[#B91C1C] flex items-center justify-between font-bold">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  <span>এই মোবাইল নম্বরটি বর্তমানে ব্লক তালিকায় রয়েছে (Customer is Blocked)</span>
                </div>
                <button
                  onClick={handleUnblockCustomer}
                  className="px-3 py-1 bg-[#15803D] text-white rounded text-[11px] font-semibold hover:bg-[#166534]"
                >
                  Unblock Customer
                </button>
              </div>
            )}

            {/* Customer Details & History Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E7E5E4] space-y-2 text-xs">
                <h4 className="font-bold text-sm text-[#1C1917]">গ্রাহকের তথ্য (Customer Profile)</h4>
                <div>
                  <span className="font-semibold text-[#1C1917]">নাম:</span> {selectedOrder.customer_name}
                </div>
                <div>
                  <span className="font-semibold text-[#1C1917]">মোবাইল:</span>{' '}
                  <span className="font-mono">{selectedOrder.customer_phone}</span>
                </div>
                <div>
                  <span className="font-semibold text-[#1C1917]">ডেলিভারি ঠিকানা:</span>{' '}
                  {selectedOrder.delivery_address}
                </div>
                <div>
                  <span className="font-semibold text-[#1C1917]">জেলা:</span> {selectedOrder.district_name}
                </div>
                {selectedOrder.order_note && (
                  <div className="pt-1 text-[#631322]">
                    <span className="font-semibold">গ্রাহকের নোট:</span> {selectedOrder.order_note}
                  </div>
                )}
              </div>

              {/* Fraud Review & Customer History Panel */}
              <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E7E5E4] space-y-2 text-xs">
                <h4 className="font-bold text-sm text-[#1C1917] flex items-center justify-between">
                  <span>পূর্ববর্তী অর্ডার হিস্ট্রি (History)</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      selectedOrder.risk_level === 'high'
                        ? 'bg-[#FEF2F2] text-[#B91C1C]'
                        : 'bg-[#F0FDF4] text-[#15803D]'
                    }`}
                  >
                    Risk: {selectedOrder.risk_level.toUpperCase()}
                  </span>
                </h4>
                {customerHistory ? (
                  <div className="space-y-1">
                    <div>
                      মোট অর্ডার: <strong>{customerHistory.total_orders}</strong>
                    </div>
                    <div>
                      সম্পন্ন অর্ডার: <strong className="text-[#15803D]">{customerHistory.completed_orders}</strong>
                    </div>
                    <div>
                      বাতিল অর্ডার: <strong className="text-[#B91C1C]">{customerHistory.cancelled_orders}</strong>
                    </div>
                    <div>
                      মোট কেনাকাটা: <strong>৳{Number(customerHistory.total_spend || 0).toLocaleString()}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="text-[#78716C]">নতুন গ্রাহক (First-time customer)</div>
                )}

                {/* Related Orders sharing this phone */}
                {relatedOrders.length > 1 && (
                  <div className="pt-2 border-t border-[#E7E5E4] text-[11px] text-[#B45309]">
                    ⚠️ এই মোবাইল নম্বরে আরও {relatedOrders.length - 1} টি অর্ডার রেকর্ড পাওয়া গেছে।
                  </div>
                )}

                {/* Block / Unblock Controls */}
                <div className="pt-2">
                  {!isBlocked ? (
                    <button
                      onClick={() => setBlockModalOpen(true)}
                      className="px-3 py-1.5 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-semibold rounded text-xs flex items-center gap-1.5"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Block Customer (গ্রাহক ব্লক করুন)</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleUnblockCustomer}
                      className="px-3 py-1.5 bg-[#15803D] hover:bg-[#166534] text-white font-semibold rounded text-xs flex items-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Unblock Customer (আনব্লক করুন)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Purchased Line Items */}
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-[#1C1917]">অর্ডারকৃত পোশাক (Items)</h4>
              <div className="border border-[#E7E5E4] rounded-xl overflow-hidden divide-y divide-[#E7E5E4] text-xs">
                {orderItems.map((item) => (
                  <div key={item.id} className="p-3 bg-white flex justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                      {item.image_url && (
                        <img src={item.image_url} alt="" className="w-12 h-14 object-cover rounded-md" />
                      )}
                      <div>
                        <div className="font-semibold text-[#1C1917]">{item.product_name}</div>
                        <div className="text-[#78716C]">{item.variant_details} • SKU: {item.sku}</div>
                        <div className="text-[#57534E]">
                          ৳{Number(item.unit_price).toLocaleString()} × {item.quantity} পিস
                        </div>
                      </div>
                    </div>
                    <div className="font-bold text-[#631322] text-sm">
                      ৳{Number(item.total_price).toLocaleString()}
                    </div>
                  </div>
                ))}
                <div className="p-3 bg-[#FAF9F5] flex justify-between font-semibold">
                  <span>ডেলিভারি চার্জ</span>
                  <span>৳{Number(selectedOrder.delivery_charge).toLocaleString()}</span>
                </div>
                <div className="p-3 bg-[#FAF9F5] flex justify-between font-bold text-sm">
                  <span>সর্বমোট প্রদেয় (COD Total)</span>
                  <span className="text-[#631322] text-base">
                    ৳{Number(selectedOrder.total_amount).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Update Controls */}
            <div className="p-5 rounded-xl border border-[#E7E5E4] bg-[#FAF9F5] space-y-4 text-xs">
              <h4 className="font-bold text-sm text-[#1C1917]">স্ট্যাটাস আপডেট (Update Order Status)</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#1C1917] mb-1">
                    Fulfillment Status (ডেলিভারি স্ট্যাটাস)
                  </label>
                  <select
                    value={newFulfillment}
                    onChange={(e) => setNewFulfillment(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#D6D3D1] rounded-lg text-xs"
                  >
                    <option value="pending">Pending (পেন্ডিং)</option>
                    <option value="confirmed">Confirmed (কনফার্মড)</option>
                    <option value="processing">Processing (প্রসেসিং)</option>
                    <option value="shipped">Shipped (কুরিয়ারে হস্তান্তর)</option>
                    <option value="delivered">Delivered (ডেলিভার্ড ও সমাপ্ত)</option>
                    <option value="cancelled">Cancelled (অর্ডার বাতিল - স্টক ব্যাক)</option>
                    <option value="returned">Returned (রিটার্ন)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1C1917] mb-1">
                    Payment Status (পেমেন্ট স্ট্যাটাস)
                  </label>
                  <select
                    value={newPayment}
                    onChange={(e) => setNewPayment(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#D6D3D1] rounded-lg text-xs"
                  >
                    <option value="pending">Pending (বাকি)</option>
                    <option value="collected">Collected (মূল্য সংগৃহীত)</option>
                    <option value="refunded">Refunded (রিফান্ড)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1C1917] mb-1">
                  Internal Staff Notes (অভ্যন্তরীণ নোট)
                </label>
                <input
                  type="text"
                  value={staffNotes}
                  onChange={(e) => setStaffNotes(e.target.value)}
                  placeholder="e.g. কাস্টমারের সাথে কথা হয়েছে, শুক্রবারে ডেলিভারি দিতে বলেছেন..."
                  className="w-full p-2.5 bg-white border border-[#D6D3D1] rounded-lg text-xs"
                />
              </div>

              {statusMessage && (
                <div className="p-2.5 bg-[#F0FDF4] text-[#15803D] font-semibold rounded-md text-xs">
                  {statusMessage}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border border-[#D6D3D1] rounded-lg text-xs font-semibold hover:bg-white"
                >
                  Close
                </button>
                <button
                  onClick={handleSaveStatus}
                  disabled={updatingStatus}
                  className="px-5 py-2 bg-[#631322] hover:bg-[#4E0E1A] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  {updatingStatus ? 'সংরক্ষণ হচ্ছে...' : 'Save Status Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Reason Customer Block Modal */}
      {blockModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 border shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-sm text-[#B91C1C] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>Confirm Block Customer</span>
              </h3>
              <button onClick={() => setBlockModalOpen(false)}>✕</button>
            </div>

            <p className="text-xs text-[#57534E]">
              মোবাইল নম্বর <strong className="text-[#1C1917]">{selectedOrder.customer_phone}</strong> ব্লক করা হলে এই নম্বরটি দিয়ে আর কোনো নতুন অর্ডার করা সম্ভব হবে না।
            </p>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#1C1917]">
                ব্লক করার কারণ লিখুন (Mandatory Reason) <span className="text-[#B91C1C]">*</span>
              </label>
              <textarea
                rows={3}
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="e.g. বারবার ফেইক অর্ডার দিয়ে পার্সেল রিসিভ করেন না..."
                className="w-full p-2.5 text-xs border border-[#D6D3D1] rounded-lg focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setBlockModalOpen(false)}
                className="px-4 py-2 border rounded text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockCustomer}
                disabled={blockLoading || !blockReason.trim()}
                className="px-4 py-2 bg-[#B91C1C] text-white rounded text-xs font-bold disabled:opacity-50"
              >
                {blockLoading ? 'ব্লক হচ্ছে...' : 'Confirm Block'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
