-- ==============================================================================
-- ROXY FASHION BD - POSTGRESQL PRODUCTION DATABASE MIGRATION
-- Compatible with Supabase, Neon, AWS RDS, and self-hosted PostgreSQL
-- ==============================================================================

-- 1. Store Settings
CREATE TABLE IF NOT EXISTS store_settings (
  id SERIAL PRIMARY KEY,
  store_name VARCHAR(255) NOT NULL DEFAULT 'Roxy Fashion BD',
  tagline_en VARCHAR(255) NOT NULL DEFAULT 'Contemporary Bangladeshi Elegance',
  tagline_bn VARCHAR(255) NOT NULL DEFAULT 'সমসাময়িক বাংলাদেশি আভিজাত্য',
  logo_url TEXT,
  favicon_url TEXT,
  phone VARCHAR(50) NOT NULL DEFAULT '+880 1812-345678',
  email VARCHAR(100) NOT NULL DEFAULT 'support@roxyfashion.com',
  address_en TEXT NOT NULL DEFAULT 'GEC Circle, Chattogram, Bangladesh',
  address_bn TEXT NOT NULL DEFAULT 'জিইসি মোড়, চট্টগ্রাম, বাংলাদেশ',
  facebook_url TEXT DEFAULT 'https://facebook.com',
  instagram_url TEXT DEFAULT 'https://instagram.com',
  default_delivery_chattogram NUMERIC(10,2) NOT NULL DEFAULT 80,
  default_delivery_national NUMERIC(10,2) NOT NULL DEFAULT 150,
  free_delivery_threshold NUMERIC(10,2) NOT NULL DEFAULT 3000,
  banner_headline_en TEXT DEFAULT 'Festive & Traditional Collection 2026',
  banner_headline_bn TEXT DEFAULT 'উৎসব ও ঐতিহ্যের নতুন সমাহার ২০২৬',
  banner_subheadline_en TEXT DEFAULT 'Handcrafted Premium Panjabi & Designer Womenswear',
  banner_subheadline_bn TEXT DEFAULT 'হাতে তৈরি প্রিমিয়াম পাঞ্জাবি এবং এক্সক্লুসিভ নারী পোশাক',
  hero_image_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Admin Users & Staff Roles
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'support_agent',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Categories & Subcategories
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name_en VARCHAR(150) NOT NULL,
  name_bn VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subcategories (
  id SERIAL PRIMARY KEY,
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name_en VARCHAR(150) NOT NULL,
  name_bn VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Attributes: Sizes & Colors
CREATE TABLE IF NOT EXISTS sizes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS colors (
  id SERIAL PRIMARY KEY,
  name_en VARCHAR(100) NOT NULL,
  name_bn VARCHAR(100) NOT NULL,
  hex_code VARCHAR(20) NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Products
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name_en VARCHAR(255) NOT NULL,
  name_bn VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  product_type VARCHAR(50) NOT NULL DEFAULT 'simple',
  short_description TEXT,
  full_description TEXT,
  sku VARCHAR(100) NOT NULL UNIQUE,
  regular_price NUMERIC(10,2) NOT NULL,
  sale_price NUMERIC(10,2),
  cost_price NUMERIC(10,2),
  main_image TEXT NOT NULL,
  gallery_images TEXT DEFAULT '[]',
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id INT REFERENCES subcategories(id) ON DELETE SET NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  stock_status VARCHAR(50) NOT NULL DEFAULT 'in_stock',
  status VARCHAR(50) NOT NULL DEFAULT 'published',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_bestseller BOOLEAN NOT NULL DEFAULT FALSE,
  is_new_arrival BOOLEAN NOT NULL DEFAULT TRUE,
  seo_title VARCHAR(255),
  seo_description TEXT,
  weight VARCHAR(50),
  specifications TEXT DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Product Variants
CREATE TABLE IF NOT EXISTS product_variants (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size_id INT REFERENCES sizes(id) ON DELETE RESTRICT,
  color_id INT REFERENCES colors(id) ON DELETE RESTRICT,
  sku VARCHAR(100) NOT NULL UNIQUE,
  regular_price NUMERIC(10,2) NOT NULL,
  sale_price NUMERIC(10,2),
  stock_quantity INT NOT NULL DEFAULT 0,
  image_url TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Bangladesh Districts & Aliases
CREATE TABLE IF NOT EXISTS districts (
  id INT PRIMARY KEY,
  name_en VARCHAR(100) NOT NULL,
  name_bn VARCHAR(100) NOT NULL,
  division VARCHAR(100) NOT NULL,
  default_delivery_charge NUMERIC(10,2) NOT NULL DEFAULT 150,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS district_aliases (
  id SERIAL PRIMARY KEY,
  district_id INT NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  alias_text VARCHAR(150) NOT NULL
);

-- 8. Configurable Delivery Rules
CREATE TABLE IF NOT EXISTS delivery_rules (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  district_id INT REFERENCES districts(id) ON DELETE CASCADE,
  zone_name VARCHAR(150),
  delivery_charge NUMERIC(10,2) NOT NULL,
  free_delivery_threshold NUMERIC(10,2),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  effective_from TIMESTAMP WITH TIME ZONE,
  effective_to TIMESTAMP WITH TIME ZONE
);

-- 9. Customers & Profiles
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150),
  delivery_address TEXT,
  total_orders INT NOT NULL DEFAULT 0,
  completed_orders INT NOT NULL DEFAULT 0,
  cancelled_orders INT NOT NULL DEFAULT 0,
  returned_orders INT NOT NULL DEFAULT 0,
  total_spend NUMERIC(12,2) NOT NULL DEFAULT 0,
  fraud_status VARCHAR(50) NOT NULL DEFAULT 'clean',
  fraud_notes TEXT,
  marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Fraud & Customer Blocklist
CREATE TABLE IF NOT EXISTS blocked_customers (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(50) NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  blocked_by VARCHAR(100),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Orders
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(100) NOT NULL UNIQUE,
  public_reference VARCHAR(100) NOT NULL UNIQUE,
  customer_id INT REFERENCES customers(id) ON DELETE SET NULL,
  customer_name VARCHAR(150) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  district_id INT NOT NULL REFERENCES districts(id),
  district_name VARCHAR(100) NOT NULL,
  delivery_address TEXT NOT NULL,
  order_note TEXT,
  payment_method VARCHAR(50) NOT NULL DEFAULT 'COD',
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  fulfillment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  risk_level VARCHAR(50) NOT NULL DEFAULT 'low',
  subtotal NUMERIC(10,2) NOT NULL,
  delivery_charge NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  coupon_code VARCHAR(50),
  staff_notes TEXT,
  assigned_staff_id INT REFERENCES admin_users(id),
  checkout_session_id VARCHAR(150),
  ip_address VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Order Items (Historical Snapshot)
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id INT REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  variant_details TEXT,
  sku VARCHAR(100) NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  image_url TEXT
);

-- 13. Inventory Movements
CREATE TABLE IF NOT EXISTS inventory_movements (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id INT REFERENCES product_variants(id) ON DELETE SET NULL,
  change_quantity INT NOT NULL,
  new_quantity INT NOT NULL,
  reason VARCHAR(100) NOT NULL,
  reference_order_id INT REFERENCES orders(id) ON DELETE SET NULL,
  created_by VARCHAR(100) DEFAULT 'system',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Checkout Abandonment Sessions
CREATE TABLE IF NOT EXISTS checkout_sessions (
  id SERIAL PRIMARY KEY,
  session_token VARCHAR(150) NOT NULL UNIQUE,
  customer_name VARCHAR(150),
  customer_phone VARCHAR(50),
  district_id INT REFERENCES districts(id),
  delivery_address TEXT,
  order_note TEXT,
  items_snapshot TEXT DEFAULT '[]',
  estimated_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  checkout_stage VARCHAR(50) NOT NULL DEFAULT 'contact_entered',
  status VARCHAR(50) NOT NULL DEFAULT 'abandoned',
  marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
  recovery_notes TEXT,
  order_id INT REFERENCES orders(id) ON DELETE SET NULL,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_type VARCHAR(20) NOT NULL DEFAULT 'percent',
  discount_value NUMERIC(10,2) NOT NULL,
  min_order_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_discount NUMERIC(10,2),
  usage_limit INT,
  usage_count INT NOT NULL DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  expiry_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Admin Audit Logs
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id SERIAL PRIMARY KEY,
  admin_user_id INT REFERENCES admin_users(id),
  admin_name VARCHAR(150),
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(100) NOT NULL,
  target_id VARCHAR(100),
  details TEXT,
  ip_address VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Speed & Performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_reference ON orders(public_reference);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_district_aliases_text ON district_aliases(alias_text);
CREATE INDEX IF NOT EXISTS idx_checkout_token ON checkout_sessions(session_token);
