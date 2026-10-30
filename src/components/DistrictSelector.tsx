'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, MapPin, Check, ChevronDown } from 'lucide-react';
import { BANGLADESH_DISTRICTS } from '@/lib/districts-data';

export interface SelectedDistrict {
  id: number;
  nameEn: string;
  nameBn: string;
  division: string;
  defaultDeliveryCharge: number;
}

interface DistrictSelectorProps {
  selectedDistrictId: number | null;
  onSelect: (district: SelectedDistrict) => void;
  error?: string;
}

export function DistrictSelector({ selectedDistrictId, onSelect, error }: DistrictSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedDistrict = useMemo(() => {
    if (!selectedDistrictId) return null;
    return BANGLADESH_DISTRICTS.find((d) => d.id === selectedDistrictId) || null;
  }, [selectedDistrictId]);

  // Outside click handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter districts by English, Bengali, or aliases
  const filteredDistricts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BANGLADESH_DISTRICTS;

    return BANGLADESH_DISTRICTS.filter((d) => {
      const matchEn = d.name_en.toLowerCase().includes(q);
      const matchBn = d.name_bn.includes(q);
      const matchDivision = d.division.toLowerCase().includes(q);
      const matchAlias = d.aliases?.some((a) => a.toLowerCase().includes(q));

      return matchEn || matchBn || matchDivision || matchAlias;
    });
  }, [query]);

  const handleSelect = (d: typeof BANGLADESH_DISTRICTS[0]) => {
    onSelect({
      id: d.id,
      nameEn: d.name_en,
      nameBn: d.name_bn,
      division: d.division,
      defaultDeliveryCharge: d.default_delivery_charge,
    });
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={wrapperRef} className="relative space-y-1">
      <label className="block text-xs font-semibold text-[#1C1917]">
        জেলা নির্বাচন করুন (Select District) <span className="text-[#B91C1C]">*</span>
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full py-3 px-3.5 bg-white border rounded-lg text-left text-sm flex items-center justify-between transition-colors shadow-2xs ${
          error
            ? 'border-[#B91C1C] ring-1 ring-[#B91C1C]'
            : isOpen
            ? 'border-[#631322] ring-1 ring-[#631322]'
            : 'border-[#D6D3D1] hover:border-[#A8A29E]'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <MapPin className="w-4 h-4 text-[#631322] shrink-0" />
          {selectedDistrict ? (
            <span className="font-medium text-[#1C1917]">
              {selectedDistrict.name_en} ({selectedDistrict.name_bn}) — {selectedDistrict.id === 1 ? '৮০৳ ডেলিভারি' : '১৫০৳ ডেলিভারি'}
            </span>
          ) : (
            <span className="text-[#78716C]">
              জেলা খুঁজুন (e.g. Chattogram, Dhaka, চট্টগ্রাম, ঢাকা)...
            </span>
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-[#78716C] shrink-0" />
      </button>

      {error && <p className="text-xs text-[#B91C1C] mt-1">{error}</p>}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-[#D6D3D1] rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
          {/* Search Input Box */}
          <div className="p-2.5 border-b border-[#E7E5E4] bg-[#FAF9F5] sticky top-0">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="জেলার নাম লিখুন (Search in English or বাংলা)..."
                autoFocus
                className="w-full bg-white border border-[#D6D3D1] focus:border-[#631322] rounded-md py-2 pl-9 pr-3 text-xs focus:outline-hidden text-[#1C1917]"
              />
              <Search className="w-3.5 h-3.5 text-[#78716C] absolute left-3 top-2.5" />
            </div>
            <div className="text-[10px] text-[#78716C] mt-1.5 flex justify-between px-1">
              <span>চট্টগ্রাম: ৮০৳ | অন্যান্য জেলা: ১৫০৳</span>
              <span>মোট ৬৪টি জেলা</span>
            </div>
          </div>

          {/* List of Districts */}
          <div className="max-h-60 overflow-y-auto divide-y divide-[#F5F3EF]">
            {filteredDistricts.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#78716C]">
                কোনো জেলা পাওয়া যায়নি (No district found)
              </div>
            ) : (
              filteredDistricts.map((d) => {
                const isSelected = selectedDistrictId === d.id;
                const isChattogram = d.id === 1;

                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handleSelect(d)}
                    className={`w-full py-2.5 px-3.5 text-left text-xs flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-[#FAF0D7] text-[#1C1917]'
                        : 'hover:bg-[#FAF9F5] text-[#1C1917]'
                    }`}
                  >
                    <div>
                      <span className="font-semibold">{d.name_en}</span>
                      <span className="ml-1.5 text-[#57534E] font-bengali">({d.name_bn})</span>
                      <span className="ml-2 text-[10px] text-[#78716C] bg-[#F5F3EF] px-1.5 py-0.5 rounded-sm">
                        {d.division}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-sm ${
                          isChattogram ? 'bg-[#F7EAEF] text-[#631322]' : 'text-[#78716C]'
                        }`}
                      >
                        ৳{isChattogram ? 80 : 150}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-[#631322]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
