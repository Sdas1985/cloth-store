'use client';

import React, { useState } from 'react';
import { Ruler, Palette, Plus, Check } from 'lucide-react';
import { Size, Color } from '@/lib/types';

interface AttributesClientProps {
  initialSizes: Size[];
  initialColors: Color[];
}

export function AttributesClient({ initialSizes, initialColors }: AttributesClientProps) {
  const [sizes, setSizes] = useState<Size[]>(initialSizes);
  const [colors, setColors] = useState<Color[]>(initialColors);

  // Add Size Form State
  const [sizeName, setSizeName] = useState('');
  const [sizeLoading, setSizeLoading] = useState(false);

  // Add Color Form State
  const [colorNameEn, setColorNameEn] = useState('');
  const [colorNameBn, setColorNameBn] = useState('');
  const [colorHex, setColorHex] = useState('#631322');
  const [colorLoading, setColorLoading] = useState(false);

  const handleAddSize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sizeName.trim()) return;
    setSizeLoading(true);

    try {
      const res = await fetch('/api/admin/attributes/size', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: sizeName.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setSizes([...sizes, { id: data.id, name: sizeName.trim(), display_order: sizes.length + 1, created_at: '' }]);
        setSizeName('');
      }
    } catch (err) {
      alert('সাইজ যোগ করতে সমস্যা হয়েছে');
    } finally {
      setSizeLoading(false);
    }
  };

  const handleAddColor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colorNameEn.trim()) return;
    setColorLoading(true);

    try {
      const res = await fetch('/api/admin/attributes/color', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nameEn: colorNameEn.trim(), nameBn: colorNameBn.trim(), hexCode: colorHex }),
      });

      if (res.ok) {
        const data = await res.json();
        setColors([
          ...colors,
          {
            id: data.id,
            name_en: colorNameEn.trim(),
            name_bn: colorNameBn.trim() || colorNameEn.trim(),
            hex_code: colorHex,
            display_order: colors.length + 1,
            created_at: '',
          },
        ]);
        setColorNameEn('');
        setColorNameBn('');
      }
    } catch (err) {
      alert('কালার যোগ করতে সমস্যা হয়েছে');
    } finally {
      setColorLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-[#E7E5E4]">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917]">
          Attributes: Sizes & Colors (সাইজ ও কালার ব্যবস্থাপনা)
        </h1>
        <p className="text-xs sm:text-sm text-[#57534E] mt-0.5">
          Manage reusable garment size charts and visual color palettes with hex swatches
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SIZES SECTION */}
        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E7E5E4]">
            <Ruler className="w-5 h-5 text-[#631322]" />
            <h2 className="text-base font-bold text-[#1C1917]">Garment Sizes (পোশাকের সাইজসমূহ)</h2>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {sizes.map((s) => (
              <div
                key={s.id}
                className="py-2 px-3.5 bg-[#FAF9F5] border border-[#D6D3D1] rounded-lg text-xs font-bold text-[#1C1917] shadow-2xs"
              >
                {s.name}
              </div>
            ))}
          </div>

          <form onSubmit={handleAddSize} className="pt-4 border-t border-[#E7E5E4] space-y-3">
            <span className="text-xs font-semibold text-[#1C1917]">নতুন সাইজ যোগ করুন:</span>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={sizeName}
                onChange={(e) => setSizeName(e.target.value)}
                placeholder="e.g. 48 (3XL) বা One Size"
                className="flex-1 p-2 text-xs bg-[#FAF9F5] border border-[#D6D3D1] rounded-lg text-[#1C1917]"
              />
              <button
                type="submit"
                disabled={sizeLoading}
                className="px-4 py-2 bg-[#631322] text-white text-xs font-bold rounded-lg hover:bg-[#4E0E1A]"
              >
                {sizeLoading ? 'যোগ হচ্ছে...' : '+ Add Size'}
              </button>
            </div>
          </form>
        </div>

        {/* COLORS SECTION */}
        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E7E5E4]">
            <Palette className="w-5 h-5 text-[#631322]" />
            <h2 className="text-base font-bold text-[#1C1917]">Color Swatches (রঙের প্যালেট)</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {colors.map((c) => (
              <div
                key={c.id}
                className="p-3 bg-[#FAF9F5] border border-[#E7E5E4] rounded-xl flex items-center gap-3"
              >
                <span
                  className="w-7 h-7 rounded-full border border-black/15 shrink-0 shadow-2xs"
                  style={{ backgroundColor: c.hex_code }}
                />
                <div className="truncate">
                  <div className="text-xs font-bold text-[#1C1917] truncate">{c.name_en}</div>
                  <div className="text-[11px] text-[#78716C] font-bengali truncate">{c.name_bn}</div>
                  <div className="text-[10px] font-mono text-[#A8A29E] uppercase">{c.hex_code}</div>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddColor} className="pt-4 border-t border-[#E7E5E4] space-y-3">
            <span className="text-xs font-semibold text-[#1C1917]">নতুন রঙ যোগ করুন:</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                required
                value={colorNameEn}
                onChange={(e) => setColorNameEn(e.target.value)}
                placeholder="English Name (e.g. Copper)"
                className="p-2 bg-[#FAF9F5] border border-[#D6D3D1] rounded-lg"
              />
              <input
                type="text"
                value={colorNameBn}
                onChange={(e) => setColorNameBn(e.target.value)}
                placeholder="বাংলা নাম (e.g. তামাটে)"
                className="p-2 bg-[#FAF9F5] border border-[#D6D3D1] rounded-lg"
              />
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="w-10 h-9 p-0.5 border rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="w-24 p-2 text-xs font-mono uppercase bg-[#FAF9F5] border rounded-lg"
              />
              <button
                type="submit"
                disabled={colorLoading}
                className="flex-1 py-2 bg-[#631322] text-white text-xs font-bold rounded-lg hover:bg-[#4E0E1A]"
              >
                {colorLoading ? 'যোগ হচ্ছে...' : '+ Add Color Swatch'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
