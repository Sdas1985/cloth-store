'use client';

import React, { useState } from 'react';
import { UserX, Phone, MessageSquare, CheckCircle2, Clock, Filter, Eye, X } from 'lucide-react';
import { CheckoutSession } from '@/lib/types';

interface AbandonmentClientProps {
  initialSessions: any[];
}

export function AbandonmentClient({ initialSessions }: AbandonmentClientProps) {
  const [sessions, setSessions] = useState<any[]>(initialSessions);
  const [statusFilter, setStatusFilter] = useState('abandoned');
  const [selectedSession, setSelectedSession] = useState<any | null>(null);

  const filteredSessions = sessions.filter((s) => {
    if (statusFilter === 'all') return true;
    return s.status === statusFilter;
  });

  const handleMarkContacted = async (sessionId: number) => {
    try {
      const res = await fetch(`/api/admin/abandonment/${sessionId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'contacted' }),
      });

      if (res.ok) {
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? { ...s, status: 'contacted' } : s))
        );
        if (selectedSession?.id === sessionId) {
          setSelectedSession({ ...selectedSession, status: 'contacted' });
        }
      }
    } catch (err) {
      alert('স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে');
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E7E5E4] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917]">
            Checkout Abandonment (পরিত্যক্ত চেকআউট ও রিকভারি)
          </h1>
          <p className="text-xs sm:text-sm text-[#57534E] mt-0.5">
            Privacy-aware recovery workflow for customers who began checkout but left before placing order
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {['abandoned', 'contacted', 'converted', 'all'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full capitalize font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-[#631322] text-white'
                  : 'bg-white border text-[#57534E] hover:border-[#631322]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-xl border border-[#E7E5E4] shadow-xs overflow-hidden">
        {filteredSessions.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#78716C]">
            এই ক্যাটাগরিতে কোনো পরিত্যক্ত চেকআউট সেশন নেই।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF9F5] border-b text-[#1C1917]">
                  <th className="p-3.5 font-bold">Session Reference</th>
                  <th className="p-3.5 font-bold">Customer Name</th>
                  <th className="p-3.5 font-bold">Mobile Phone</th>
                  <th className="p-3.5 font-bold">District</th>
                  <th className="p-3.5 font-bold">Est. Total</th>
                  <th className="p-3.5 font-bold">Stage Reached</th>
                  <th className="p-3.5 font-bold">Status</th>
                  <th className="p-3.5 font-bold text-right">Quick Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4]">
                {filteredSessions.map((s) => {
                  const bdPhoneClean = s.customer_phone?.replace(/\D/g, '') || '';
                  const waNumber = bdPhoneClean.startsWith('0') ? `88${bdPhoneClean}` : bdPhoneClean;
                  const waMessage = encodeURIComponent(
                    `আসসালামু আলাইকুম ${s.customer_name || 'স্যার/ম্যাম'}, রক্সি ফ্যাশন থেকে যোগাযোগ করা হচ্ছে। আপনি আমাদের ওয়েবসাইটে অর্ডার শুরু করেছিলেন। অর্ডার সম্পন্ন করতে কি কোনো সহায়তা প্রয়োজন?`
                  );

                  return (
                    <tr key={s.id} className="hover:bg-[#FAF9F5]">
                      <td className="p-3.5 font-mono text-[#631322] font-semibold">
                        {s.session_token.slice(0, 16)}...
                      </td>
                      <td className="p-3.5 font-semibold text-[#1C1917]">
                        {s.customer_name || <span className="text-[#A8A29E]">Not typed</span>}
                      </td>
                      <td className="p-3.5 font-mono text-[#57534E]">
                        {s.customer_phone || <span className="text-[#A8A29E]">Not typed</span>}
                      </td>
                      <td className="p-3.5 text-[#57534E]">{s.district_name || 'N/A'}</td>
                      <td className="p-3.5 font-bold text-[#1C1917]">
                        ৳{Number(s.estimated_total || 0).toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        <span className="text-[10px] font-semibold bg-[#F5F3EF] px-2 py-0.5 rounded-sm">
                          {s.checkout_stage}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            s.status === 'converted'
                              ? 'bg-[#F0FDF4] text-[#15803D]'
                              : s.status === 'contacted'
                              ? 'bg-[#EFF6FF] text-[#1D4ED8]'
                              : 'bg-[#FFFBEB] text-[#B45309]'
                          }`}
                        >
                          {s.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        {s.customer_phone && (
                          <>
                            <a
                              href={`tel:${s.customer_phone}`}
                              className="p-1.5 inline-flex items-center text-[#1C1917] hover:text-[#631322] bg-[#FAF9F5] border rounded"
                              title="Direct Call"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={`https://wa.me/${waNumber}?text=${waMessage}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 inline-flex items-center text-[#15803D] hover:bg-[#F0FDF4] bg-[#FAF9F5] border rounded"
                              title="WhatsApp Message"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          </>
                        )}
                        <button
                          onClick={() => setSelectedSession(s)}
                          className="p-1.5 inline-flex items-center text-[#631322] bg-[#FAF9F5] border rounded"
                          title="View Bag Items"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b">
              <div>
                <h3 className="font-bold text-sm text-[#1C1917]">Abandoned Bag Details</h3>
                <div className="text-xs text-[#78716C] font-mono">{selectedSession.session_token}</div>
              </div>
              <button onClick={() => setSelectedSession(null)} className="p-1 text-[#78716C]">
                ✕
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-[#57534E]">
              <div>Customer: <strong className="text-[#1C1917]">{selectedSession.customer_name || 'Not provided'}</strong></div>
              <div>Phone: <strong className="text-[#1C1917]">{selectedSession.customer_phone || 'Not provided'}</strong></div>
              <div>District: {selectedSession.district_name}</div>
              <div>Address: {selectedSession.delivery_address || 'Not typed'}</div>
              <div>Estimated Value: <strong className="text-[#631322]">৳{Number(selectedSession.estimated_total).toLocaleString()}</strong></div>
            </div>

            {/* Items Left in Bag */}
            <div className="pt-2">
              <h4 className="font-bold text-xs text-[#1C1917] mb-2">ব্যাগে ফেলে যাওয়া পণ্যসমূহ (Items)</h4>
              <div className="border rounded-lg divide-y text-xs max-h-48 overflow-y-auto">
                {selectedSession.items_snapshot.map((item: any, idx: number) => (
                  <div key={idx} className="p-2.5 flex justify-between items-center bg-white">
                    <div>
                      <div className="font-semibold text-[#1C1917]">{item.name}</div>
                      <div className="text-[11px] text-[#78716C]">
                        {item.size && `Size: ${item.size} `}
                        {item.color && `• Color: ${item.color} `}
                        • Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="font-bold text-[#631322]">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t flex justify-between items-center">
              <button
                onClick={() => handleMarkContacted(selectedSession.id)}
                className="px-4 py-2 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-lg"
              >
                ✓ Mark as Contacted
              </button>
              <button
                onClick={() => setSelectedSession(null)}
                className="px-4 py-2 border rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
