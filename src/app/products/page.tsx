import React from 'react';
import Link from 'next/link';
import { getFilteredProducts, getCategories } from '@/lib/products';
import { ProductCard } from '@/components/ProductCard';
import { SlidersHorizontal } from 'lucide-react';

export const revalidate = 0;

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    filter?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const categorySlug = params.category;
  const search = params.search;
  const filter = params.filter;
  const sort = params.sort;
  const page = Number(params.page || 1);

  const [categories, { products, total }] = await Promise.all([
    getCategories(),
    getFilteredProducts({
      categorySlug,
      search,
      filter,
      sort,
      page,
      limit: 24,
    }),
  ]);

  const activeCategory = categories.find((c) => c.slug === categorySlug);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb & Title */}
      <div className="mb-6 pb-4 border-b border-[#E7E5E4]">
        <div className="text-xs text-[#78716C] mb-2 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#631322]">হোম (Home)</Link>
          <span>/</span>
          <span className="text-[#1C1917] font-medium">
            {activeCategory ? activeCategory.name_en : search ? `Search: "${search}"` : 'All Collections'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917]">
              {activeCategory ? activeCategory.name_en : search ? `Search Results for "${search}"` : 'All Collections (সকল পোশাক)'}
            </h1>
            <p className="text-xs sm:text-sm text-[#57534E] mt-1 font-bengali">
              {activeCategory?.name_bn || 'সেরা মানের ফ্যাশন পোশাক সমাহার'} • মোট {total} টি প্রোডাক্ট
            </p>
          </div>

          {/* Quick Filters / Sorting */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#78716C] hidden sm:inline">Sort by:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <Link
                href={`/products?${new URLSearchParams({ ...(categorySlug ? { category: categorySlug } : {}), ...(search ? { search } : {}), sort: 'newest' }).toString()}`}
                className={`px-3 py-1.5 rounded-full border transition-colors ${
                  !sort || sort === 'newest'
                    ? 'bg-[#631322] text-white border-[#631322]'
                    : 'bg-white text-[#57534E] border-[#E7E5E4] hover:border-[#631322]'
                }`}
              >
                Newest
              </Link>
              <Link
                href={`/products?${new URLSearchParams({ ...(categorySlug ? { category: categorySlug } : {}), ...(search ? { search } : {}), sort: 'price_asc' }).toString()}`}
                className={`px-3 py-1.5 rounded-full border transition-colors ${
                  sort === 'price_asc'
                    ? 'bg-[#631322] text-white border-[#631322]'
                    : 'bg-white text-[#57534E] border-[#E7E5E4] hover:border-[#631322]'
                }`}
              >
                Price: Low to High
              </Link>
              <Link
                href={`/products?${new URLSearchParams({ ...(categorySlug ? { category: categorySlug } : {}), ...(search ? { search } : {}), sort: 'price_desc' }).toString()}`}
                className={`px-3 py-1.5 rounded-full border transition-colors ${
                  sort === 'price_desc'
                    ? 'bg-[#631322] text-white border-[#631322]'
                    : 'bg-white text-[#57534E] border-[#E7E5E4] hover:border-[#631322]'
                }`}
              >
                Price: High to Low
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        <Link
          href="/products"
          className={`px-4 py-2 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
            !categorySlug
              ? 'bg-[#1C1917] text-white'
              : 'bg-white text-[#57534E] border border-[#E7E5E4] hover:border-[#1C1917]'
          }`}
        >
          All Products (সব)
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/category/${c.slug}`}
            className={`px-4 py-2 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              categorySlug === c.slug
                ? 'bg-[#1C1917] text-white'
                : 'bg-white text-[#57534E] border border-[#E7E5E4] hover:border-[#1C1917]'
            }`}
          >
            {c.name_en} ({c.name_bn})
          </Link>
        ))}
      </div>

      {/* Products Grid: Exactly 2 cards per row on mobile phone widths */}
      {products.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E7E5E4] p-12 text-center max-w-lg mx-auto my-12">
          <SlidersHorizontal className="w-10 h-10 text-[#78716C] mx-auto mb-3" />
          <h3 className="text-base font-semibold text-[#1C1917]">কোনো প্রোডাক্ট পাওয়া যায়নি</h3>
          <p className="text-xs sm:text-sm text-[#57534E] mt-1 mb-6">
            We couldn't find any products matching your selected criteria.
          </p>
          <Link
            href="/products"
            className="px-6 py-2.5 bg-[#631322] text-white text-xs sm:text-sm font-medium rounded-md hover:bg-[#4E0E1A]"
          >
            Clear Filters & View All
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
