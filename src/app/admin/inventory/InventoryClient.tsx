'use client';

import React, { useState } from 'react';
import { Boxes, AlertTriangle, CheckCircle2, History, Edit, Search } from 'lucide-react';
import { InventoryMovement } from '@/lib/types';

interface InventoryClientProps {
  initialInventory: any[];
  initialMovements: InventoryMovement[];
}

export function InventoryClient({ initialInventory, initialMovements }: InventoryClientProps) {
  const [items, setItems] = useState<any[]>(initialInventory);
  const [movements, setMovements] = useState<InventoryMovement[]>(initialMovements);
  const [search, setSearch] = useState('');

  // Stock Adjustment Modal
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [newStock, setNewStock] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('restock');
  const [adjustLoading, setAdjustLoading] = useState(false);

  const filteredItems = items.filter((item) => {
    return (
      !search ||
      item.product_name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setAdjustLoading(true);

    try {
      const res = await fetch('/api/admin/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedItem.product_id,
          variantId: selectedItem.variant_id || null,
          newQuantity: newStock,
          reason: adjustReason,
        }),
      });

      if (res.ok) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === selectedItem.id ? { ...i, stock_quantity: newStock } : i
          )
        );
        setSelectedItem(null);
        alert('স্টক সফলভাবে আপডেট করা হয়েছে!');
      } else {
        alert('স্টক আপডেট ব্যর্থ হয়েছে');
      }
    } catch (err) {
      alert('সার্ভার ত্রুটি');
    } finally {
      setAdjustLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-[#E7E5E4] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917]">
            Inventory Management (ইনভেন্টরি ও স্টক)
          </h1>
          <p className="text-xs sm:text-sm text-[#57534E] mt-0.5">
            Real-time variant-level warehouse stock, adjustments, and movement logs
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by SKU or Name..."
            className="w-full py-2 pl-9 pr-3 text-xs bg-white border border-[#D6D3D1] rounded-lg"
          />
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Stock Levels Table */}
      <div className="bg-white rounded-xl border border-[#E7E5E4] shadow-xs overflow-hidden">
        <div className="p-4 bg-[#FAF9F5] border-b border-[#E7E5E4] flex justify-between items-center text-xs">
          <span className="font-bold text-[#1C1917]">Current Stock per Variant & Product</span>
          <span className="text-[#78716C]">Total SKU Records: {filteredItems.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF9F5] border-b border-[#E7E5E4] text-[#1C1917]">
                <th className="p-3.5 font-bold">Product</th>
                <th className="p-3.5 font-bold">Variant Details</th>
                <th className="p-3.5 font-bold">SKU</th>
                <th className="p-3.5 font-bold">Current Stock</th>
                <th className="p-3.5 font-bold">Alert Level</th>
                <th className="p-3.5 font-bold text-right">Adjust Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E5E4]">
              {filteredItems.map((item) => {
                const isOut = item.stock_quantity <= 0;
                const isLow = item.stock_quantity > 0 && item.stock_quantity <= 5;

                return (
                  <tr key={item.id} className="hover:bg-[#FAF9F5]">
                    <td className="p-3.5 font-semibold text-[#1C1917]">{item.product_name}</td>
                    <td className="p-3.5 text-[#57534E]">{item.variant_label || 'Single Product'}</td>
                    <td className="p-3.5 font-mono text-[#631322] font-medium">{item.sku}</td>
                    <td className="p-3.5 font-bold text-sm text-[#1C1917]">{item.stock_quantity} pcs</td>
                    <td className="p-3.5">
                      {isOut ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF2F2] text-[#B91C1C]">
                          OUT OF STOCK
                        </span>
                      ) : isLow ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFFBEB] text-[#B45309]">
                          LOW STOCK (≤5)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#15803D]">
                          HEALTHY
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setNewStock(item.stock_quantity);
                        }}
                        className="px-3 py-1.5 bg-[#FAF9F5] hover:bg-[#631322] hover:text-white border border-[#D6D3D1] rounded-md text-[11px] font-semibold transition-colors"
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Movements Log */}
      <div className="bg-white rounded-xl border border-[#E7E5E4] p-5 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-[#1C1917] flex items-center gap-2">
          <History className="w-4 h-4 text-[#631322]" />
          <span>Audit Log of Stock Movements (স্টক পরিবর্তনের ইতিহাস)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF9F5] border-b text-[#78716C]">
                <th className="p-2.5">Date</th>
                <th className="p-2.5">Reason</th>
                <th className="p-2.5">Change Qty</th>
                <th className="p-2.5">New Balance</th>
                <th className="p-2.5">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E5E4]">
              {movements.slice(0, 10).map((m) => (
                <tr key={m.id}>
                  <td className="p-2.5 text-[#78716C]">{new Date(m.created_at).toLocaleString()}</td>
                  <td className="p-2.5 font-semibold text-[#1C1917]">{m.reason}</td>
                  <td className="p-2.5 font-bold">
                    <span className={m.change_quantity > 0 ? 'text-[#15803D]' : 'text-[#B91C1C]'}>
                      {m.change_quantity > 0 ? `+${m.change_quantity}` : m.change_quantity}
                    </span>
                  </td>
                  <td className="p-2.5">{m.new_quantity} pcs</td>
                  <td className="p-2.5 text-[#57534E]">{m.created_by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl border">
            <h3 className="font-bold text-sm text-[#1C1917]">
              স্টক সমন্বয় (Adjust Stock): {selectedItem.sku}
            </h3>
            <p className="text-xs text-[#57534E]">
              {selectedItem.product_name} ({selectedItem.variant_label || 'Standard'})
            </p>

            <form onSubmit={handleAdjustSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">নতুন স্টক পরিমাণ (New Quantity)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newStock}
                  onChange={(e) => setNewStock(Number(e.target.value))}
                  className="w-full p-2.5 border rounded-lg font-bold text-base bg-[#FAF9F5]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">পরিবর্তনের কারণ (Reason)</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-white"
                >
                  <option value="restock">নতুন চালান বা রিস্টক (Restock)</option>
                  <option value="audit_correction">ফিজিক্যাল অডিট সংশোধন (Audit Correction)</option>
                  <option value="damage_loss">ত্রুটি বা নষ্ট (Damage / Loss)</option>
                  <option value="return">কাস্টমার রিটার্ন (Customer Return)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 border rounded text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustLoading}
                  className="px-5 py-2 bg-[#631322] text-white font-bold rounded text-xs"
                >
                  {adjustLoading ? 'সংরক্ষণ হচ্ছে...' : 'Update Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
