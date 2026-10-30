import {
  getStoreSettings as repoGetStoreSettings,
  getCategories as repoGetCategories,
  getProducts as repoGetProducts,
  getProductBySlug as repoGetProductBySlug,
  getProductById as repoGetProductById,
} from '../../server/storeRepo';
import { Product, ProductVariant, Category, StoreSettings } from './types';

export async function getStoreSettings(): Promise<StoreSettings> {
  const settings = await repoGetStoreSettings();
  return {
    id: settings.id,
    store_name: settings.store_name,
    tagline_en: settings.tagline_en,
    tagline_bn: settings.tagline_bn,
    phone: settings.phone,
    email: settings.email,
    address_en: settings.address_en,
    address_bn: settings.address_bn,
    default_delivery_chattogram: settings.default_delivery_chattogram,
    default_delivery_national: settings.default_delivery_national,
    free_delivery_threshold: settings.free_delivery_threshold,
    banner_headline_en: settings.banner_headline_en,
    banner_headline_bn: settings.banner_headline_bn,
    banner_subheadline_en: settings.banner_subheadline_en,
    banner_subheadline_bn: settings.banner_subheadline_bn,
    updated_at: settings.updated_at ? new Date(settings.updated_at).toISOString() : new Date().toISOString(),
  };
}

export async function getCategories(): Promise<Category[]> {
  const categories = await repoGetCategories();
  return categories.map((c) => ({
    id: c.id,
    name_en: c.name_en,
    name_bn: c.name_bn,
    slug: c.slug,
    description: c.description || '',
    image_url: c.image_url || '',
    sort_order: c.sort_order,
    is_active: c.is_active,
    created_at: c.created_at ? new Date(c.created_at).toISOString() : new Date().toISOString(),
  }));
}

export async function getProductVariants(productId: number): Promise<ProductVariant[]> {
  const product = await repoGetProductById(productId);
  if (!product || !product.variants) return [];
  return product.variants.map((v) => ({
    id: v.id,
    product_id: productId,
    size_name: v.size_name || '',
    color_name_en: v.color_name_en || '',
    color_name_bn: v.color_name_bn || '',
    color_hex: v.color_hex || '',
    sku: v.sku,
    regular_price: v.regular_price,
    sale_price: v.sale_price || null,
    stock_quantity: v.stock_quantity,
    image_url: v.image_url || '',
    is_enabled: v.is_enabled,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const p = await repoGetProductBySlug(slug);
  if (!p) return null;
  return transformProduct(p);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const { products } = await repoGetProducts({ featured: true, limit });
  return products.map(transformProduct);
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  const { products } = await repoGetProducts({ newArrival: true, limit });
  return products.map(transformProduct);
}

export async function getBestSellers(limit = 8): Promise<Product[]> {
  const { products } = await repoGetProducts({ bestseller: true, limit });
  return products.map(transformProduct);
}

export async function getFilteredProducts(options: {
  categorySlug?: string;
  search?: string;
  filter?: string;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<{ products: Product[]; total: number }> {
  let sortBy: 'price_asc' | 'price_desc' | 'newest' | 'popular' | undefined;
  if (options.sort === 'price_asc') sortBy = 'price_asc';
  else if (options.sort === 'price_desc') sortBy = 'price_desc';
  else if (options.sort === 'newest') sortBy = 'newest';

  const isNew = options.filter === 'new' ? true : undefined;
  const isBestseller = options.filter === 'bestseller' ? true : undefined;
  const isFeatured = options.filter === 'featured' ? true : undefined;

  const { products, total } = await repoGetProducts({
    categorySlug: options.categorySlug,
    search: options.search,
    sortBy,
    newArrival: isNew,
    bestseller: isBestseller,
    featured: isFeatured,
    page: options.page || 1,
    limit: options.limit || 24,
  });

  return {
    products: products.map(transformProduct),
    total,
  };
}

function transformProduct(p: any): Product {
  const variants: ProductVariant[] = (p.variants || []).map((v: any) => ({
    id: v.id,
    product_id: p.id,
    size_name: v.size_name || '',
    color_name_en: v.color_name_en || '',
    color_name_bn: v.color_name_bn || '',
    color_hex: v.color_hex || '',
    sku: v.sku,
    regular_price: v.regular_price,
    sale_price: v.sale_price || null,
    stock_quantity: v.stock_quantity,
    image_url: v.image_url || '',
    is_enabled: v.is_enabled !== false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  const specifications: Record<string, string> =
    p.specifications instanceof Map
      ? Object.fromEntries(p.specifications)
      : typeof p.specifications === 'object' && p.specifications !== null
      ? p.specifications
      : {};

  return {
    id: p.id,
    name_en: p.name_en,
    name_bn: p.name_bn,
    slug: p.slug,
    product_type: p.product_type || 'simple',
    short_description: p.short_description || '',
    full_description: p.full_description || '',
    sku: p.sku,
    regular_price: p.regular_price,
    sale_price: p.sale_price || null,
    main_image: p.main_image,
    gallery_images: Array.isArray(p.gallery_images) ? p.gallery_images : [],
    category_id: p.category_id || null,
    category_name_en: p.category_name_en || '',
    category_name_bn: p.category_name_bn || '',
    category_slug: p.category_slug || '',
    subcategory_id: null,
    subcategory_name_en: '',
    stock_quantity: p.stock_quantity || 0,
    stock_status: p.stock_status || 'in_stock',
    status: p.status || 'published',
    is_featured: Boolean(p.is_featured),
    is_bestseller: Boolean(p.is_bestseller),
    is_new_arrival: Boolean(p.is_new_arrival),
    weight: p.weight || '',
    specifications,
    variants,
    created_at: p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString(),
    updated_at: p.updated_at ? new Date(p.updated_at).toISOString() : new Date().toISOString(),
  };
}
