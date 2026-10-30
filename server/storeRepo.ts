import { connectToDatabase, isFallbackMode } from './db';
import { ProductModel, IProduct } from './models/Product';
import { CategoryModel, ICategory } from './models/Category';
import { OrderModel, IOrder } from './models/Order';
import { StoreSettingModel, IStoreSetting } from './models/StoreSetting';
import { AdminUserModel, IAdminUser } from './models/AdminUser';
import {
  INITIAL_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_DISTRICTS,
} from './seedData';
import bcrypt from 'bcryptjs';

// In-memory runtime data cache for fallback / fast reads
let memorySettings: any = { ...INITIAL_SETTINGS };
let memoryCategories: any[] = JSON.parse(JSON.stringify(INITIAL_CATEGORIES));
let memoryProducts: any[] = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
let memoryOrders: any[] = [];
let memoryDistricts: any[] = JSON.parse(JSON.stringify(INITIAL_DISTRICTS));
let memoryAdmins: any[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@roxyfashion.com',
    password_hash: bcrypt.hashSync('roxy2026', 10),
    name: 'Roxy Store Admin',
    role: 'super_admin',
    is_active: true,
  },
];

let isInitialized = false;

export async function initStore(): Promise<void> {
  if (isInitialized) return;
  const { isConnected, isFallback } = await connectToDatabase();

  if (isConnected && !isFallback) {
    try {
      // Seed categories if empty
      const catCount = await CategoryModel.countDocuments();
      if (catCount === 0) {
        await CategoryModel.insertMany(INITIAL_CATEGORIES);
        console.log('[MongoDB] Seeded initial categories.');
      }

      // Seed products if empty
      const prodCount = await ProductModel.countDocuments();
      if (prodCount === 0) {
        await ProductModel.insertMany(INITIAL_PRODUCTS);
        console.log('[MongoDB] Seeded initial luxury products.');
      }

      // Seed settings if empty
      const settingsCount = await StoreSettingModel.countDocuments();
      if (settingsCount === 0) {
        await StoreSettingModel.create(INITIAL_SETTINGS);
        console.log('[MongoDB] Seeded initial store settings.');
      }

      // Seed admin if empty
      const adminCount = await AdminUserModel.countDocuments();
      if (adminCount === 0) {
        await AdminUserModel.create(memoryAdmins[0]);
        console.log('[MongoDB] Seeded default admin user.');
      }
    } catch (e: any) {
      console.error('[MongoDB Seeding Error]', e.message);
    }
  }

  isInitialized = true;
}

// ----------------- STORE SETTINGS -----------------
export async function getStoreSettings(): Promise<IStoreSetting> {
  await initStore();
  if (!isFallbackMode()) {
    try {
      const doc = await StoreSettingModel.findOne({ id: 1 }).lean();
      if (doc) return doc as any;
    } catch {}
  }
  return memorySettings;
}

export async function updateStoreSettings(update: Partial<IStoreSetting>): Promise<IStoreSetting> {
  await initStore();
  memorySettings = { ...memorySettings, ...update, updated_at: new Date() };
  if (!isFallbackMode()) {
    try {
      await StoreSettingModel.findOneAndUpdate({ id: 1 }, { $set: update }, { upsert: true, new: true });
    } catch {}
  }
  return memorySettings;
}

// ----------------- CATEGORIES -----------------
export async function getCategories(): Promise<ICategory[]> {
  await initStore();
  if (!isFallbackMode()) {
    try {
      const list = await CategoryModel.find({ is_active: true }).sort({ sort_order: 1 }).lean();
      if (list && list.length > 0) return list as any;
    } catch {}
  }
  return memoryCategories.filter((c) => c.is_active);
}

// ----------------- PRODUCTS -----------------
export interface ProductQueryFilters {
  search?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  page?: number;
  limit?: number;
}

export async function getProducts(filters: ProductQueryFilters = {}): Promise<{
  products: IProduct[];
  total: number;
  totalPages: number;
  currentPage: number;
}> {
  await initStore();
  const page = Math.max(1, filters.page || 1);
  const limit = Math.max(1, Math.min(50, filters.limit || 12));

  if (!isFallbackMode()) {
    try {
      const query: any = { status: 'published' };
      if (filters.categorySlug) query.category_slug = filters.categorySlug;
      if (filters.featured !== undefined) query.is_featured = filters.featured;
      if (filters.bestseller !== undefined) query.is_bestseller = filters.bestseller;
      if (filters.newArrival !== undefined) query.is_new_arrival = filters.newArrival;

      if (filters.search) {
        const regex = new RegExp(filters.search, 'i');
        query.$or = [{ name_en: regex }, { name_bn: regex }, { sku: regex }, { short_description: regex }];
      }

      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        query.regular_price = {};
        if (filters.minPrice !== undefined) query.regular_price.$gte = filters.minPrice;
        if (filters.maxPrice !== undefined) query.regular_price.$lte = filters.maxPrice;
      }

      let sortOption: any = { is_featured: -1, created_at: -1 };
      if (filters.sortBy === 'price_asc') sortOption = { regular_price: 1 };
      if (filters.sortBy === 'price_desc') sortOption = { regular_price: -1 };
      if (filters.sortBy === 'newest') sortOption = { created_at: -1 };
      if (filters.sortBy === 'popular') sortOption = { is_bestseller: -1, is_featured: -1 };

      const total = await ProductModel.countDocuments(query);
      const docs = await ProductModel.find(query)
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      return {
        products: docs as any,
        total,
        totalPages: Math.ceil(total / limit) || 1,
        currentPage: page,
      };
    } catch {}
  }

  // Fallback memory querying
  let list = memoryProducts.filter((p) => p.status === 'published');

  if (filters.categorySlug) {
    list = list.filter((p) => p.category_slug === filters.categorySlug);
  }
  if (filters.featured !== undefined) {
    list = list.filter((p) => Boolean(p.is_featured) === filters.featured);
  }
  if (filters.bestseller !== undefined) {
    list = list.filter((p) => Boolean(p.is_bestseller) === filters.bestseller);
  }
  if (filters.newArrival !== undefined) {
    list = list.filter((p) => Boolean(p.is_new_arrival) === filters.newArrival);
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name_en.toLowerCase().includes(s) ||
        p.name_bn.includes(s) ||
        p.sku.toLowerCase().includes(s) ||
        (p.short_description && p.short_description.toLowerCase().includes(s))
    );
  }
  if (filters.minPrice !== undefined) {
    list = list.filter((p) => (p.sale_price || p.regular_price) >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    list = list.filter((p) => (p.sale_price || p.regular_price) <= filters.maxPrice!);
  }

  if (filters.sortBy === 'price_asc') {
    list.sort((a, b) => (a.sale_price || a.regular_price) - (b.sale_price || b.regular_price));
  } else if (filters.sortBy === 'price_desc') {
    list.sort((a, b) => (b.sale_price || b.regular_price) - (a.sale_price || a.regular_price));
  }

  const total = list.length;
  const paginated = list.slice((page - 1) * limit, page * limit);

  return {
    products: paginated,
    total,
    totalPages: Math.ceil(total / limit) || 1,
    currentPage: page,
  };
}

export async function getProductBySlug(slug: string): Promise<IProduct | null> {
  await initStore();
  if (!isFallbackMode()) {
    try {
      const doc = await ProductModel.findOne({ slug, status: 'published' }).lean();
      if (doc) return doc as any;
    } catch {}
  }
  return memoryProducts.find((p) => p.slug === slug && p.status === 'published') || null;
}

export async function getProductById(id: number): Promise<IProduct | null> {
  await initStore();
  if (!isFallbackMode()) {
    try {
      const doc = await ProductModel.findOne({ id }).lean();
      if (doc) return doc as any;
    } catch {}
  }
  return memoryProducts.find((p) => p.id === id) || null;
}

export async function createProduct(productData: any): Promise<IProduct> {
  await initStore();
  const nextId = Math.max(...memoryProducts.map((p) => p.id), 0) + 1;
  const newProd = {
    ...productData,
    id: nextId,
    created_at: new Date(),
    updated_at: new Date(),
  };

  memoryProducts.unshift(newProd);

  if (!isFallbackMode()) {
    try {
      await ProductModel.create(newProd);
    } catch (e: any) {
      console.error('[MongoDB Error creating product]', e.message);
    }
  }

  return newProd;
}

export async function updateProduct(id: number, update: any): Promise<IProduct | null> {
  await initStore();
  const idx = memoryProducts.findIndex((p) => p.id === id);
  if (idx !== -1) {
    memoryProducts[idx] = { ...memoryProducts[idx], ...update, updated_at: new Date() };
  }

  if (!isFallbackMode()) {
    try {
      const doc = await ProductModel.findOneAndUpdate({ id }, { $set: update }, { new: true }).lean();
      if (doc) return doc as any;
    } catch {}
  }

  return memoryProducts[idx] || null;
}

export async function deleteProduct(id: number): Promise<boolean> {
  await initStore();
  memoryProducts = memoryProducts.filter((p) => p.id !== id);

  if (!isFallbackMode()) {
    try {
      await ProductModel.deleteOne({ id });
      return true;
    } catch {}
  }
  return true;
}

// ----------------- ORDERS -----------------
export async function createOrder(orderData: any): Promise<IOrder> {
  await initStore();
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const publicReference = `RX-${year}-${randomSuffix}`;

  const newOrder: IOrder = {
    public_reference: publicReference,
    customer_name: orderData.customerName,
    customer_phone: orderData.customerPhone,
    district_id: orderData.districtId,
    district_name: orderData.districtName,
    delivery_address: orderData.deliveryAddress,
    order_note: orderData.orderNote || '',
    items: orderData.items,
    subtotal: orderData.subtotal,
    delivery_charge: orderData.deliveryCharge,
    discount_amount: orderData.discountAmount || 0,
    total_amount: orderData.totalAmount,
    payment_method: orderData.paymentMethod || 'cash_on_delivery',
    payment_status: 'unpaid',
    order_status: 'pending',
    tracking_history: [
      {
        status: 'pending',
        note: 'অর্ডারটি সফলভাবে গৃহীত হয়েছে। শীঘ্রই নিশ্চিত করা হবে।',
        timestamp: new Date(),
      },
    ],
    created_at: new Date(),
    updated_at: new Date(),
  };

  memoryOrders.unshift(newOrder);

  if (!isFallbackMode()) {
    try {
      await OrderModel.create(newOrder);
    } catch (e: any) {
      console.error('[MongoDB Order creation error]', e.message);
    }
  }

  return newOrder;
}

export async function getOrderByRef(ref: string): Promise<IOrder | null> {
  await initStore();
  if (!isFallbackMode()) {
    try {
      const doc = await OrderModel.findOne({ public_reference: ref.toUpperCase().trim() }).lean();
      if (doc) return doc as any;
    } catch {}
  }
  return memoryOrders.find((o) => o.public_reference.toUpperCase() === ref.toUpperCase().trim()) || null;
}

export async function getOrdersByPhone(phone: string): Promise<IOrder[]> {
  await initStore();
  if (!isFallbackMode()) {
    try {
      const docs = await OrderModel.find({ customer_phone: phone }).sort({ created_at: -1 }).lean();
      if (docs && docs.length > 0) return docs as any;
    } catch {}
  }
  return memoryOrders.filter((o) => o.customer_phone === phone);
}

export async function getAllOrders(): Promise<IOrder[]> {
  await initStore();
  if (!isFallbackMode()) {
    try {
      const docs = await OrderModel.find().sort({ created_at: -1 }).lean();
      if (docs) return docs as any;
    } catch {}
  }
  return memoryOrders;
}

export async function updateOrderStatus(
  refOrId: string,
  newStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  note?: string
): Promise<IOrder | null> {
  await initStore();
  const statusNote = note || `অর্ডার স্ট্যাটাস পরিবর্তিত হয়েছে: ${newStatus}`;

  const idx = memoryOrders.findIndex((o) => o.public_reference === refOrId);
  if (idx !== -1) {
    memoryOrders[idx].order_status = newStatus;
    memoryOrders[idx].tracking_history.push({
      status: newStatus,
      note: statusNote,
      timestamp: new Date(),
    });
    memoryOrders[idx].updated_at = new Date();
  }

  if (!isFallbackMode()) {
    try {
      const doc = await OrderModel.findOneAndUpdate(
        { public_reference: refOrId },
        {
          $set: { order_status: newStatus, updated_at: new Date() },
          $push: { tracking_history: { status: newStatus, note: statusNote, timestamp: new Date() } },
        },
        { new: true }
      ).lean();
      if (doc) return doc as any;
    } catch {}
  }

  return memoryOrders[idx] || null;
}

// ----------------- DISTRICTS & DELIVERY -----------------
export function getDistricts() {
  return memoryDistricts;
}

export function calculateDeliveryCharge(districtId: number, subtotal: number): number {
  if (subtotal >= memorySettings.free_delivery_threshold) {
    return 0; // Free delivery for orders above threshold
  }
  // District 1 is Chattogram
  if (districtId === 1) {
    return memorySettings.default_delivery_chattogram; // 80 BDT
  }
  return memorySettings.default_delivery_national; // 150 BDT
}

// ----------------- ADMIN AUTH -----------------
export async function findAdminByUsername(username: string): Promise<IAdminUser | null> {
  await initStore();
  if (!isFallbackMode()) {
    try {
      const doc = await AdminUserModel.findOne({ username, is_active: true }).lean();
      if (doc) return doc as any;
    } catch {}
  }
  return memoryAdmins.find((a) => a.username === username && a.is_active) || null;
}
