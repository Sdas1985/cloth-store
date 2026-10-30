import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProductBySlug, getFilteredProducts } from '@/lib/products';
import { ProductDetailView } from '@/components/ProductDetailView';

export const revalidate = 0;

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found | Roxy Fashion BD',
    };
  }

  const price = product.sale_price || product.regular_price;

  return {
    title: `${product.name_en} (${product.name_bn}) | Roxy Fashion BD`,
    description:
      product.short_description ||
      `Buy ${product.name_en} at ৳${price} in Bangladesh. Cash on Delivery available across all 64 districts.`,
    openGraph: {
      title: product.name_en,
      description: product.short_description,
      images: [{ url: product.main_image }],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Fetch related products in same category
  const { products: related } = await getFilteredProducts({
    categorySlug: product.category_slug,
    limit: 4,
  });

  const filteredRelated = related.filter((p) => p.id !== product.id);

  // Structured Data (JSON-LD) for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name_en,
    image: product.main_image,
    description: product.short_description,
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BDT',
      price: product.sale_price || product.regular_price,
      availability:
        product.stock_status === 'in_stock'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Roxy Fashion BD',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailView product={product} relatedProducts={filteredRelated} />
    </>
  );
}
