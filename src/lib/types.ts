export type ProductType = 'simple' | 'variable';
export type StockStatus = 'in_stock' | 'out_of_stock' | 'on_backorder';
export type ProductStatus = 'draft' | 'published' | 'archived';

export interface Category {
  id: number;
  name_en: string;
  name_bn: string;
  slug: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Subcategory {
  id: number;
  category_id: number;
  name_en: string;
  name_bn: string;
  slug: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Size {
  id: number;
  name: string;
  display_order: number;
  created_at: string;
}

export interface Color {
  id: number;
  name_en: string;
  name_bn: string;
  hex_code: string;
  display_order: number;
  created_at: string;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  size_id?: number | null;
  size_name?: string;
  color_id?: number | null;
  color_name_en?: string;
  color_name_bn?: string;
  color_hex?: string;
  sku: string;
  regular_price: number;
  sale_price?: number | null;
  stock_quantity: number;
  image_url?: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name_en: string;
  name_bn: string;
  slug: string;
  product_type: ProductType;
  short_description?: string;
  full_description?: string;
  sku: string;
  regular_price: number;
  sale_price?: number | null;
  cost_price?: number | null;
  main_image: string;
  gallery_images: string[];
  category_id?: number | null;
  category_name_en?: string;
  category_name_bn?: string;
  category_slug?: string;
  subcategory_id?: number | null;
  subcategory_name_en?: string;
  stock_quantity: number;
  stock_status: StockStatus;
  status: ProductStatus;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  seo_title?: string;
  seo_description?: string;
  weight?: string;
  specifications?: Record<string, string>;
  variants?: ProductVariant[];
  created_at: string;
  updated_at: string;
}

export interface District {
  id: number;
  name_en: string;
  name_bn: string;
  division: string;
  default_delivery_charge: number;
  is_active: boolean;
}

export interface DistrictAlias {
  id: number;
  district_id: number;
  alias_text: string;
}

export interface DeliveryRule {
  id: number;
  title: string;
  district_id?: number | null;
  district_name?: string;
  zone_name?: string;
  delivery_charge: number;
  free_delivery_threshold?: number | null;
  is_active: boolean;
  effective_from?: string;
  effective_to?: string;
}

export type OrderPaymentStatus = 'pending' | 'collected' | 'failed' | 'refunded';
export type OrderFulfillmentStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'returned';
export type OrderRiskLevel = 'low' | 'medium' | 'high';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  variant_id?: number | null;
  product_name: string;
  variant_details?: string;
  sku: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  image_url?: string;
}

export interface Order {
  id: number;
  order_number: string;
  public_reference: string;
  customer_id?: number | null;
  customer_name: string;
  customer_phone: string;
  district_id: number;
  district_name: string;
  delivery_address: string;
  order_note?: string;
  payment_method: 'COD';
  payment_status: OrderPaymentStatus;
  fulfillment_status: OrderFulfillmentStatus;
  risk_level: OrderRiskLevel;
  subtotal: number;
  delivery_charge: number;
  discount_amount: number;
  total_amount: number;
  coupon_code?: string;
  staff_notes?: string;
  assigned_staff_id?: number | null;
  assigned_staff_name?: string;
  checkout_session_id?: string;
  ip_address?: string;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  phone: string;
  name: string;
  email?: string;
  delivery_address?: string;
  total_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  returned_orders: number;
  total_spend: number;
  fraud_status: 'clean' | 'suspicious' | 'blocked';
  fraud_notes?: string;
  marketing_consent: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlockedCustomer {
  id: number;
  phone: string;
  reason: string;
  blocked_by?: string;
  is_active: boolean;
  created_at: string;
}

export type CheckoutStage = 'contact_entered' | 'address_entered' | 'delivery_selected' | 'order_placed';
export type AbandonmentStatus = 'abandoned' | 'recovered' | 'converted' | 'contacted' | 'do_not_contact';

export interface CheckoutSession {
  id: number;
  session_token: string;
  customer_name?: string;
  customer_phone?: string;
  district_id?: number;
  district_name?: string;
  delivery_address?: string;
  order_note?: string;
  items_snapshot: CartItemSnapshot[];
  estimated_total: number;
  checkout_stage: CheckoutStage;
  status: AbandonmentStatus;
  marketing_consent: boolean;
  recovery_notes?: string;
  order_id?: number;
  last_active_at: string;
  created_at: string;
}

export interface CartItemSnapshot {
  product_id: number;
  variant_id?: number | null;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

export interface CartItem {
  id: string; // unique composite: productId + '-' + (variantId || '0')
  productId: number;
  variantId?: number | null;
  name: string;
  slug: string;
  sku: string;
  price: number;
  regularPrice: number;
  quantity: number;
  maxStock: number;
  size?: string;
  color?: string;
  image: string;
}

export interface StoreSettings {
  id: number;
  store_name: string;
  tagline_en: string;
  tagline_bn: string;
  logo_url?: string;
  favicon_url?: string;
  phone: string;
  email: string;
  address_en: string;
  address_bn: string;
  facebook_url?: string;
  instagram_url?: string;
  default_delivery_chattogram: number;
  default_delivery_national: number;
  free_delivery_threshold: number;
  banner_headline_en?: string;
  banner_headline_bn?: string;
  banner_subheadline_en?: string;
  banner_subheadline_bn?: string;
  hero_image_url?: string;
  updated_at: string;
}

export type AdminRole = 'super_admin' | 'order_manager' | 'product_manager' | 'support_agent';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: number;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_order_value: number;
  max_discount?: number | null;
  usage_limit?: number | null;
  usage_count: number;
  start_date?: string;
  expiry_date?: string;
  is_active: boolean;
  created_at: string;
}

export interface InventoryMovement {
  id: number;
  product_id: number;
  variant_id?: number | null;
  change_quantity: number;
  new_quantity: number;
  reason: 'order_placement' | 'order_cancellation' | 'restock' | 'manual_adjustment' | 'return';
  reference_order_id?: number | null;
  created_by?: string;
  created_at: string;
  product_name?: string;
  sku?: string;
}

export interface AdminAuditLog {
  id: number;
  admin_user_id?: number | null;
  admin_name?: string;
  action: string;
  target_type: string;
  target_id?: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}
