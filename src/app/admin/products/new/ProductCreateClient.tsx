'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  Layers,
  Palette,
  Ruler,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { Category, Subcategory, Size, Color, ProductType } from '@/lib/types';

interface ProductCreateClientProps {
  categories: Category[];
  subcategories: Subcategory[];
  sizes: Size[];
  colors: Color[];
}

export function ProductCreateClient({
  categories: initialCategories,
  subcategories: initialSubcategories,
  sizes: initialSizes,
  colors: initialColors,
}: ProductCreateClientProps) {
  const router = useRouter();

  // 1. FIRST REQUIRED SELECTION: Product Type
  const [productType, setProductType] = useState<ProductType>('simple');

  // Basic Information
  const [nameEn, setNameEn] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');

  // Pricing
  const [regularPrice, setRegularPrice] = useState<number | ''>('');
  const [salePrice, setSalePrice] = useState<number | ''>('');
  const [costPrice, setCostPrice] = useState<number | ''>(''); // Admin only

  // Media
  const [mainImage, setMainImage] = useState('https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=900&q=80');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [newGalleryInput, setNewGalleryInput] = useState('');

  // Taxonomy
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [subcategories, setSubcategories] = useState<Subcategory[]>(initialSubcategories);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>(categories[0]?.id || '');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | ''>('');

  // Inventory & Status (Simple Product)
  const [stockQuantity, setStockQuantity] = useState<number>(20);
  const [stockStatus, setStockStatus] = useState<'in_stock' | 'out_of_stock' | 'on_backorder'>('in_stock');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('published');

  // Flags
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);

  // SEO & Specs
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [fabricSpec, setFabricSpec] = useState('100% Premium Cotton');
  const [careSpec, setCareSpec] = useState('Dry clean or gentle hand wash');

  // Variable Product Attributes & Variant Matrix
  const [availableSizes, setAvailableSizes] = useState<Size[]>(initialSizes);
  const [availableColors, setAvailableColors] = useState<Color[]>(initialColors);

  const [selectedSizeIds, setSelectedSizeIds] = useState<number[]>([]);
  const [selectedColorIds, setSelectedColorIds] = useState<number[]>([]);

  // Generated Variants Matrix
  interface MatrixVariant {
    id: string;
    sizeId: number | null;
    sizeName: string;
    colorId: number | null;
    colorName: string;
    colorHex: string;
    sku: string;
    regularPrice: number;
    salePrice: number | null;
    stockQuantity: number;
    imageUrl: string;
    isEnabled: boolean;
  }

  const [variantsMatrix, setVariantsMatrix] = useState<MatrixVariant[]>([]);

  // Inline Quick Add Size / Color
  const [newSizeName, setNewSizeName] = useState('');
  const [newColorNameEn, setNewColorNameEn] = useState('');
  const [newColorNameBn, setNewColorNameBn] = useState('');
  const [newColorHex, setNewColorHex] = useState('#631322');

  // Form Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Auto-generate SKU when name changes
  const handleNameChange = (val: string) => {
    setNameEn(val);
    if (!sku) {
      const initials = val.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'ROX');
      const random = Math.floor(100 + Math.random() * 900);
      setSku(`ROX-${initials}-${random}`);
    }
  };

  // Build or update variant combinations
  const generateVariantCombinations = () => {
    if (selectedSizeIds.length === 0 && selectedColorIds.length === 0) {
      alert('অনুগ্রহ করে কমপক্ষে একটি সাইজ অথবা একটি রঙ নির্বাচন করুন।');
      return;
    }

    const sizesToUse = selectedSizeIds.length > 0 ? selectedSizeIds : [null];
    const colorsToUse = selectedColorIds.length > 0 ? selectedColorIds : [null];

    const newMatrix: MatrixVariant[] = [];

    sizesToUse.forEach((sId) => {
      colorsToUse.forEach((cId) => {
        const sizeObj = availableSizes.find((s) => s.id === sId);
        const colorObj = availableColors.find((c) => c.id === cId);

        const key = `${sId || '0'}-${cId || '0'}`;
        const existing = variantsMatrix.find((v) => v.id === key);

        if (existing) {
          newMatrix.push(existing);
        } else {
          const sizeLabel = sizeObj?.name || '';
          const colorLabel = colorObj?.name_en || '';
          const variantSku = `${sku || 'ROX'}-${colorLabel.slice(0, 3).toUpperCase()}-${sizeLabel.replace(/\s+/g, '')}`;

          newMatrix.push({
            id: key,
            sizeId: sId,
            sizeName: sizeLabel,
            colorId: cId,
            colorName: colorLabel,
            colorHex: colorObj?.hex_code || '#000000',
            sku: variantSku,
            regularPrice: Number(regularPrice || 0),
            salePrice: salePrice ? Number(salePrice) : null,
            stockQuantity: 10,
            imageUrl: mainImage,
            isEnabled: true,
          });
        }
      });
    });

    setVariantsMatrix(newMatrix);
  };

  // Add New Size directly from editor
  const handleAddCustomSize = () => {
    if (!newSizeName.trim()) return;
    const newId = Date.now();
    const newSize: Size = {
      id: newId,
      name: newSizeName.trim(),
      display_order: availableSizes.length + 1,
      created_at: new Date().toISOString(),
    };
    setAvailableSizes([...availableSizes, newSize]);
    setSelectedSizeIds([...selectedSizeIds, newId]);
    setNewSizeName('');
  };

  // Add New Color directly from editor
  const handleAddCustomColor = () => {
    if (!newColorNameEn.trim()) return;
    const newId = Date.now();
    const newColor: Color = {
      id: newId,
      name_en: newColorNameEn.trim(),
      name_bn: newColorNameBn.trim() || newColorNameEn.trim(),
      hex_code: newColorHex,
      display_order: availableColors.length + 1,
      created_at: new Date().toISOString(),
    };
    setAvailableColors([...availableColors, newColor]);
    setSelectedColorIds([...selectedColorIds, newId]);
    setNewColorNameEn('');
    setNewColorNameBn('');
  };

  const handleAddGalleryImage = () => {
    if (!newGalleryInput.trim()) return;
    setGalleryImages([...galleryImages, newGalleryInput.trim()]);
    setNewGalleryInput('');
  };

  // Submit Product Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nameEn.trim() || !nameBn.trim()) {
      setError('নাম বাংলায় ও ইংরেজিতে দেওয়া আবশ্যক');
      return;
    }
    if (!sku.trim()) {
      setError('SKU কোড দেওয়া আবশ্যক');
      return;
    }
    if (!regularPrice) {
      setError('রেগুলার প্রাইস দেওয়া আবশ্যক');
      return;
    }

    if (productType === 'variable' && variantsMatrix.length === 0) {
      setError('ভেরিয়েবল প্রোডাক্টের জন্য কমপক্ষে একটি ভ্যারিয়েন্ট কম্বিনেশন তৈরি করুন');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameEn: nameEn.trim(),
          nameBn: nameBn.trim(),
          slug: slug.trim() || undefined,
          productType,
          shortDescription: shortDescription.trim(),
          fullDescription: fullDescription.trim(),
          sku: sku.trim(),
          regularPrice: Number(regularPrice),
          salePrice: salePrice ? Number(salePrice) : null,
          costPrice: costPrice ? Number(costPrice) : null,
          mainImage: mainImage.trim(),
          galleryImages,
          categoryId: selectedCategoryId || null,
          subcategoryId: selectedSubcategoryId || null,
          stockQuantity: productType === 'simple' ? Number(stockQuantity) : 0,
          stockStatus,
          status,
          isFeatured,
          isBestseller,
          isNewArrival,
          seoTitle: seoTitle.trim() || undefined,
          seoDescription: seoDescription.trim() || undefined,
          specifications: {
            Fabric: fabricSpec,
            'Care Instructions': careSpec,
          },
          variants: productType === 'variable' ? variantsMatrix : [],
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'প্রোডাক্ট সংরক্ষণ করা যায়নি');
        setIsSubmitting(false);
        return;
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err: any) {
      setError('সার্ভারে যোগাযোগ করা যায়নি');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E7E5E4]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#78716C] mb-1">
            <Link href="/admin/products" className="hover:text-[#631322]">Products</Link>
            <span>/</span>
            <span className="text-[#1C1917] font-medium">New</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917]">
            Add New Product (নতুন পণ্য তৈরি করুন)
          </h1>
          <p className="text-xs sm:text-sm text-[#57534E] mt-0.5">
            Create simple or variable products with size, color, SKU, and variant inventory
          </p>
        </div>

        <Link
          href="/admin/products"
          className="px-4 py-2 border border-[#D6D3D1] hover:border-[#631322] rounded-lg text-xs font-semibold text-[#1C1917]"
        >
          Cancel
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-xs text-[#B91C1C] flex items-center gap-2 font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* STEP 1: FIRST REQUIRED SELECTION - PRODUCT TYPE */}
        <div className="bg-white rounded-2xl border-2 border-[#631322] p-6 shadow-sm space-y-4">
          <div>
            <span className="text-xs font-bold text-[#631322] uppercase tracking-wider">
              Step 1: Required Type Selection
            </span>
            <h2 className="text-lg font-bold text-[#1C1917] mt-1">
              Select Product Type (প্রোডাক্টের ধরন নির্বাচন করুন)
            </h2>
            <p className="text-xs text-[#57534E]">
              Choose whether this product has a single configuration or multiple sizes/colors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                productType === 'simple'
                  ? 'border-[#631322] bg-[#FAF9F5] shadow-xs'
                  : 'border-[#E7E5E4] hover:border-[#A8A29E]'
              }`}
            >
              <input
                type="radio"
                name="productType"
                value="simple"
                checked={productType === 'simple'}
                onChange={() => setProductType('simple')}
                className="mt-1 text-[#631322] focus:ring-[#631322]"
              />
              <div>
                <span className="font-bold text-sm text-[#1C1917] block">Simple Product (সাধারণ পণ্য)</span>
                <span className="text-xs text-[#57534E] leading-relaxed block mt-0.5">
                  একটিমাত্র কনফিগারেশন। কোনো ভ্যারিয়েন্ট বা সাইজ/কালার বৈচিত্র্য ছাড়াই সরাসরি ক্রয়যোগ্য।
                </span>
              </div>
            </label>

            <label
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                productType === 'variable'
                  ? 'border-[#631322] bg-[#FAF9F5] shadow-xs'
                  : 'border-[#E7E5E4] hover:border-[#A8A29E]'
              }`}
            >
              <input
                type="radio"
                name="productType"
                value="variable"
                checked={productType === 'variable'}
                onChange={() => setProductType('variable')}
                className="mt-1 text-[#631322] focus:ring-[#631322]"
              />
              <div>
                <span className="font-bold text-sm text-[#1C1917] block">Variable Product (ভ্যারিয়েবল পণ্য)</span>
                <span className="text-xs text-[#57534E] leading-relaxed block mt-0.5">
                  একাধিক সাইজ (যেমন: 38, 40, 42) এবং কালার (মেরুন, নেভি, আইভরি) সমন্বয়ে পৃথক স্টক ও SKU সহ পণ্য।
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* STEP 2: BASIC PRODUCT INFORMATION */}
        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#1C1917] pb-2 border-b border-[#E7E5E4]">
            Basic Information (সাধারণ বিবরণ)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Product Name in English <span className="text-[#B91C1C]">*</span>
              </label>
              <input
                type="text"
                required
                value={nameEn}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Royal Embroidered Jacquard Panjabi"
                className="w-full p-2.5 bg-[#FAF9F5] border border-[#D6D3D1] rounded-lg text-xs text-[#1C1917]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                প্রোডাক্টের নাম বাংলায় (Name in Bengali) <span className="text-[#B91C1C]">*</span>
              </label>
              <input
                type="text"
                required
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                placeholder="e.g. রয়েল এমব্রয়ডারি জ্যাকার্ড পাঞ্জাবি"
                className="w-full p-2.5 bg-[#FAF9F5] border border-[#D6D3D1] rounded-lg text-xs text-[#1C1917]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Base SKU Code <span className="text-[#B91C1C]">*</span>
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="ROX-PAN-001"
                className="w-full p-2.5 bg-[#FAF9F5] border border-[#D6D3D1] rounded-lg text-xs font-mono text-[#1C1917]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                URL Slug (Optional - auto generated)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="royal-embroidered-jacquard-panjabi"
                className="w-full p-2.5 bg-[#FAF9F5] border border-[#D6D3D1] rounded-lg text-xs text-[#1C1917]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1917] mb-1">
              Short Description (সংক্ষিপ্ত বিবরণ)
            </label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Exquisite metallic embroidery collar with breathable premium jacquard blend fabric."
              className="w-full p-2.5 bg-[#FAF9F5] border border-[#D6D3D1] rounded-lg text-xs text-[#1C1917]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1917] mb-1">
              Full Detailed Description (বিস্তারিত বিবরণ)
            </label>
            <textarea
              rows={4}
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              placeholder="Designed for Eid festivals and high-society weddings in Bangladesh..."
              className="w-full p-2.5 bg-[#FAF9F5] border border-[#D6D3D1] rounded-lg text-xs text-[#1C1917]"
            />
          </div>
        </div>

        {/* STEP 3: PRICING & COST */}
        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#1C1917] pb-2 border-b border-[#E7E5E4]">
            Pricing & Financials (মূল্য নির্ধারণ)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Regular Price (৳) <span className="text-[#B91C1C]">*</span>
              </label>
              <input
                type="number"
                required
                value={regularPrice}
                onChange={(e) => setRegularPrice(Number(e.target.value))}
                placeholder="2850"
                className="w-full p-2.5 bg-[#FAF9F5] border border-[#D6D3D1] rounded-lg text-xs font-bold text-[#1C1917]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Sale Price (৳ - Optional)
              </label>
              <input
                type="number"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value ? Number(e.target.value) : '')}
                placeholder="2450"
                className="w-full p-2.5 bg-[#FAF9F5] border border-[#D6D3D1] rounded-lg text-xs font-bold text-[#631322]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#78716C] mb-1">
                Cost Price (৳ - Admin Only)
              </label>
              <input
                type="number"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value ? Number(e.target.value) : '')}
                placeholder="1400"
                className="w-full p-2.5 bg-[#FAF9F5] border border-[#D6D3D1] rounded-lg text-xs text-[#57534E]"
              />
              <span className="text-[10px] text-[#78716C]">Used for gross profit estimation</span>
            </div>
          </div>
        </div>

        {/* STEP 4: CATEGORY & TAXONOMY */}
        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#1C1917] pb-2 border-b border-[#E7E5E4]">
            Category & Collection (ক্যাটাগরি)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">Category</label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                className="w-full p-2.5 bg-[#FAF9F5] border border-[#D6D3D1] rounded-lg text-xs font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_en} ({c.name_bn})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">Subcategory (Optional)</label>
              <select
                value={selectedSubcategoryId}
                onChange={(e) => setSelectedSubcategoryId(e.target.value ? Number(e.target.value) : '')}
                className="w-full p-2.5 bg-[#FAF9F5] border border-[#D6D3D1] rounded-lg text-xs"
              >
                <option value="">None</option>
                {subcategories
                  .filter((s) => !selectedCategoryId || s.category_id === Number(selectedCategoryId))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name_en} ({s.name_bn})
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* STEP 5: MEDIA & IMAGES */}
        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#1C1917] pb-2 border-b border-[#E7E5E4]">
            Product Imagery (ছবি)
          </h3>

          <div>
            <label className="block text-xs font-semibold text-[#1C1917] mb-1">
              Main Display Image URL <span className="text-[#B91C1C]">*</span>
            </label>
            <input
              type="url"
              required
              value={mainImage}
              onChange={(e) => setMainImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full p-2.5 bg-[#FAF9F5] border border-[#D6D3D1] rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1917] mb-1">
              Add Additional Gallery Images
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={newGalleryInput}
                onChange={(e) => setNewGalleryInput(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 p-2.5 bg-[#FAF9F5] border border-[#D6D3D1] rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={handleAddGalleryImage}
                className="px-4 py-2 bg-[#631322] text-white rounded-lg text-xs font-semibold"
              >
                + Add Image
              </button>
            </div>

            {galleryImages.length > 0 && (
              <div className="flex gap-3 mt-3 overflow-x-auto pb-2">
                {galleryImages.map((img, i) => (
                  <div key={i} className="relative w-16 h-20 rounded-md overflow-hidden border">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setGalleryImages(galleryImages.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* STEP 6: DYNAMIC VARIANT CONFIGURATION (IF VARIABLE PRODUCT) */}
        {productType === 'variable' && (
          <div className="bg-white rounded-2xl border-2 border-[#D4AF37] p-6 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold text-[#C5A059] uppercase tracking-wider">
                Variable Configuration
              </span>
              <h3 className="text-lg font-bold text-[#1C1917] mt-0.5">
                Sizes, Colors & Variant Inventory Matrix
              </h3>
              <p className="text-xs text-[#57534E]">
                Select the available sizes and colors, then click "Generate Matrix" to customize SKU, price, and stock for each combination.
              </p>
            </div>

            {/* Sizes Selection & Inline Size Creator */}
            <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#E7E5E4] space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-[#1C1917] flex items-center gap-1.5">
                  <Ruler className="w-4 h-4 text-[#631322]" />
                  <span>Available Sizes (সাইজ নির্বাচন করুন)</span>
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {availableSizes.map((s) => {
                  const isChecked = selectedSizeIds.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSelectedSizeIds(
                          isChecked ? selectedSizeIds.filter((id) => id !== s.id) : [...selectedSizeIds, s.id]
                        );
                      }}
                      className={`py-2 px-3.5 text-xs font-semibold rounded-lg border transition-colors ${
                        isChecked
                          ? 'bg-[#631322] text-white border-[#631322]'
                          : 'bg-white text-[#1C1917] border-[#D6D3D1] hover:border-[#631322]'
                      }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>

              {/* Inline Size Adder */}
              <div className="pt-2 flex gap-2 max-w-sm">
                <input
                  type="text"
                  value={newSizeName}
                  onChange={(e) => setNewSizeName(e.target.value)}
                  placeholder="নতুন সাইজ (e.g. 48 (3XL))..."
                  className="p-2 text-xs bg-white border border-[#D6D3D1] rounded-md flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSize}
                  className="px-3 py-1.5 bg-[#FAF9F5] border border-[#D6D3D1] hover:border-[#631322] text-xs font-semibold rounded-md"
                >
                  + Add Size
                </button>
              </div>
            </div>

            {/* Colors Selection & Inline Color Creator */}
            <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#E7E5E4] space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-[#1C1917] flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-[#631322]" />
                  <span>Available Colors with Swatches (রঙ নির্বাচন করুন)</span>
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {availableColors.map((c) => {
                  const isChecked = selectedColorIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedColorIds(
                          isChecked ? selectedColorIds.filter((id) => id !== c.id) : [...selectedColorIds, c.id]
                        );
                      }}
                      className={`flex items-center gap-2 py-1.5 px-3 rounded-full border text-xs font-medium transition-colors ${
                        isChecked
                          ? 'bg-[#1C1917] text-white border-[#1C1917]'
                          : 'bg-white text-[#1C1917] border-[#D6D3D1] hover:border-[#1C1917]'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: c.hex_code }}
                      />
                      <span>{c.name_en} ({c.name_bn})</span>
                    </button>
                  );
                })}
              </div>

              {/* Inline Color Creator */}
              <div className="pt-2 flex flex-wrap gap-2 items-center text-xs">
                <input
                  type="text"
                  value={newColorNameEn}
                  onChange={(e) => setNewColorNameEn(e.target.value)}
                  placeholder="Color Name En (e.g. Olive)"
                  className="p-2 bg-white border border-[#D6D3D1] rounded-md"
                />
                <input
                  type="text"
                  value={newColorNameBn}
                  onChange={(e) => setNewColorNameBn(e.target.value)}
                  placeholder="বাংলায় নাম (e.g. জলপাই)"
                  className="p-2 bg-white border border-[#D6D3D1] rounded-md"
                />
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="w-9 h-8 p-0.5 border rounded cursor-pointer"
                />
                <button
                  type="button"
                  onClick={handleAddCustomColor}
                  className="px-3 py-2 bg-[#FAF9F5] border border-[#D6D3D1] hover:border-[#631322] font-semibold rounded-md"
                >
                  + Add Color
                </button>
              </div>
            </div>

            {/* Matrix Generator Trigger */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-[#57534E]">
                নির্বাচিত সাইজ: {selectedSizeIds.length} | নির্বাচিত কালার: {selectedColorIds.length}
              </span>
              <button
                type="button"
                onClick={generateVariantCombinations}
                className="px-5 py-2.5 bg-[#631322] hover:bg-[#4E0E1A] text-white text-xs font-bold rounded-lg shadow-xs"
              >
                ⚡ Generate Variant Matrix
              </button>
            </div>

            {/* Generated Matrix Table */}
            {variantsMatrix.length > 0 && (
              <div className="border border-[#E7E5E4] rounded-xl overflow-hidden overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF9F5] border-b border-[#E7E5E4] text-[#1C1917]">
                      <th className="p-3 font-bold">Variant (Size / Color)</th>
                      <th className="p-3 font-bold">Variant SKU</th>
                      <th className="p-3 font-bold">Regular Price</th>
                      <th className="p-3 font-bold">Sale Price</th>
                      <th className="p-3 font-bold">Stock Qty</th>
                      <th className="p-3 font-bold">Active</th>
                      <th className="p-3 font-bold text-right">Remove</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E5E4]">
                    {variantsMatrix.map((vm, idx) => (
                      <tr key={vm.id} className="hover:bg-[#FAF9F5]">
                        <td className="p-3 font-semibold text-[#1C1917]">
                          <div className="flex items-center gap-2">
                            {vm.colorHex && (
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                                style={{ backgroundColor: vm.colorHex }}
                              />
                            )}
                            <span>{vm.sizeName || 'Free Size'} / {vm.colorName || 'Default Color'}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={vm.sku}
                            onChange={(e) => {
                              const updated = [...variantsMatrix];
                              updated[idx].sku = e.target.value;
                              setVariantsMatrix(updated);
                            }}
                            className="p-1.5 border rounded w-36 font-mono bg-white"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={vm.regularPrice}
                            onChange={(e) => {
                              const updated = [...variantsMatrix];
                              updated[idx].regularPrice = Number(e.target.value);
                              setVariantsMatrix(updated);
                            }}
                            className="p-1.5 border rounded w-24 bg-white font-bold"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={vm.salePrice || ''}
                            onChange={(e) => {
                              const updated = [...variantsMatrix];
                              updated[idx].salePrice = e.target.value ? Number(e.target.value) : null;
                              setVariantsMatrix(updated);
                            }}
                            placeholder="Optional"
                            className="p-1.5 border rounded w-24 bg-white"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={vm.stockQuantity}
                            onChange={(e) => {
                              const updated = [...variantsMatrix];
                              updated[idx].stockQuantity = Number(e.target.value);
                              setVariantsMatrix(updated);
                            }}
                            className="p-1.5 border rounded w-20 bg-white"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={vm.isEnabled}
                            onChange={(e) => {
                              const updated = [...variantsMatrix];
                              updated[idx].isEnabled = e.target.checked;
                              setVariantsMatrix(updated);
                            }}
                            className="w-4 h-4 text-[#631322] rounded"
                          />
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => setVariantsMatrix(variantsMatrix.filter((_, i) => i !== idx))}
                            className="text-[#78716C] hover:text-[#B91C1C]"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* STEP 7: STOCK & PROMOTION TOGGLES (SIMPLE PRODUCT STOCK) */}
        {productType === 'simple' && (
          <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#1C1917] pb-2 border-b border-[#E7E5E4]">
              Inventory & Availability (স্টক পরিমাণ)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                  Stock Quantity (মজুত সংখ্যা)
                </label>
                <input
                  type="number"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#D6D3D1] rounded-lg text-xs font-bold text-[#1C1917]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                  Stock Status
                </label>
                <select
                  value={stockStatus}
                  onChange={(e) => setStockStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#D6D3D1] rounded-lg text-xs"
                >
                  <option value="in_stock">In Stock (ইন স্টক)</option>
                  <option value="out_of_stock">Out of Stock (স্টক শেষ)</option>
                  <option value="on_backorder">On Backorder (প্রি-অর্ডার)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* PROMOTION BADGES */}
        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#1C1917] pb-2 border-b border-[#E7E5E4]">
            Storefront Badges & Visibility (প্রদর্শন ব্যাজ)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
            <label className="flex items-center gap-2 p-3 bg-[#FAF9F5] rounded-xl border border-[#E7E5E4] cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-[#631322] rounded"
              />
              <span>Featured Product (ফিচারড পণ্য)</span>
            </label>

            <label className="flex items-center gap-2 p-3 bg-[#FAF9F5] rounded-xl border border-[#E7E5E4] cursor-pointer">
              <input
                type="checkbox"
                checked={isBestseller}
                onChange={(e) => setIsBestseller(e.target.checked)}
                className="w-4 h-4 text-[#631322] rounded"
              />
              <span>Best Seller Badge (জনপ্রিয় পণ্য)</span>
            </label>

            <label className="flex items-center gap-2 p-3 bg-[#FAF9F5] rounded-xl border border-[#E7E5E4] cursor-pointer">
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="w-4 h-4 text-[#631322] rounded"
              />
              <span>New Arrival (নতুন সমাহার)</span>
            </label>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end gap-4 pt-4">
          <Link
            href="/admin/products"
            className="px-6 py-3 border border-[#D6D3D1] hover:border-[#631322] rounded-xl text-xs font-semibold"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-[#631322] hover:bg-[#4E0E1A] disabled:bg-[#A8A29E] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <span>প্রোডাক্ট তৈরি হচ্ছে...</span>
            ) : (
              <>
                <span>Publish Product (প্রকাশ করুন)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
