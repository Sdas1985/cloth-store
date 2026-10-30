import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCategories, getFilteredProducts } from '@/lib/products';
import { ProductCard } from '@/components/ProductCard';

export const revalidate = 0;

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categories = await getCategories();
  const currentCategory = categories.find((c) => c.slug === slug);

  if (!currentCategory) {
    notFound();
  }

  const { products, total } = await getFilteredProducts({
    categorySlug: slug,
    limit: 30,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Category Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-[#1C1917] text-white p-8 sm:p-12 mb-8 shadow-md">
        <div className="relative z-10 max-w-xl space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#D4AF37]">
            Roxy Signature Collection
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold">
            {currentCategory.name_en}
          </h1>
          <p className="text-sm sm:text-base text-[#D6D3D1] font-bengali">
            {currentCategory.name_bn} — {currentCategory.description || 'এক্সক্লুসিভ ডিজাইনার পোশাক সমাহার'}
          </p>
          <div className="text-xs text-[#A8A29E] pt-2">
            Showing all {total} available designs
          </div>
        </div>

        {currentCategory.image_url && (
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 hidden md:block">
            <img
              src={currentCategory.image_url}
              alt={currentCategory.name_en}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Product Grid: 2 per row on mobile */}
      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-[#E7E5E4]">
          <p className="text-sm text-[#57534E]">এই ক্যাটাগরিতে বর্তমানে কোনো প্রোডাক্ট নেই।</p>
          <Link
            href="/products"
            className="mt-4 inline-block px-6 py-2 bg-[#631322] text-white text-xs font-medium rounded-md"
          >
            সব কালেকশন দেখুন
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
