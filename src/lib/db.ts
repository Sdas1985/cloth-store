import path from 'path';
import fs from 'fs';
import { Pool } from 'pg';
import Database from 'better-sqlite3';
import { BANGLADESH_DISTRICTS } from './districts-data';
import bcrypt from 'bcryptjs';

// Global singleton for connection pools across hot reloads
declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __sqliteDb: Database.Database | undefined;
  // eslint-disable-next-line no-var
  var __dbInitialized: boolean | undefined;
  // eslint-disable-next-line no-var
  var __dbInitializing: boolean | undefined;
}

const DATABASE_URL = process.env.DATABASE_URL;
const isPostgres = Boolean(DATABASE_URL && DATABASE_URL.startsWith('postgres'));

function getPgPool(): Pool {
  if (!global.__pgPool) {
    global.__pgPool = new Pool({
      connectionString: DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }
  return global.__pgPool;
}

function getSqliteDb(): Database.Database {
  if (!global.__sqliteDb) {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = path.join(dataDir, 'roxy_store.db');
    const db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    global.__sqliteDb = db;
  }
  return global.__sqliteDb;
}

export interface DbResult {
  lastInsertId: number;
  changes: number;
}

/**
 * Universal Query Method
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  await ensureDbInitialized();

  if (isPostgres) {
    const pool = getPgPool();
    // Convert ? to $1, $2, ... if any were passed
    let psql = sql;
    let paramIndex = 1;
    psql = psql.replace(/\?/g, () => `$${paramIndex++}`);

    const res = await pool.query(psql, params);
    return res.rows as T[];
  } else {
    const db = getSqliteDb();
    // Convert $1, $2, ... to ? if any were passed
    const ssql = sql.replace(/\$\d+/g, '?');
    const stmt = db.prepare(ssql);
    const rows = stmt.all(...params);
    return rows as T[];
  }
}

export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function execute(sql: string, params: any[] = []): Promise<DbResult> {
  await ensureDbInitialized();

  if (isPostgres) {
    const pool = getPgPool();
    let psql = sql;
    let paramIndex = 1;
    psql = psql.replace(/\?/g, () => `$${paramIndex++}`);

    const res = await pool.query(psql, params);
    return {
      lastInsertId: (res.rows?.[0]?.id as number) || 0,
      changes: res.rowCount || 0,
    };
  } else {
    const db = getSqliteDb();
    const ssql = sql.replace(/\$\d+/g, '?');
    const stmt = db.prepare(ssql);
    const info = stmt.run(...params);
    return {
      lastInsertId: Number(info.lastInsertRowid) || 0,
      changes: info.changes || 0,
    };
  }
}

/**
 * Transaction Runner
 */
export async function withTransaction<T>(callback: (runner: {
  query: typeof query;
  queryOne: typeof queryOne;
  execute: typeof execute;
}) => Promise<T>): Promise<T> {
  await ensureDbInitialized();

  if (isPostgres) {
    const pool = getPgPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const txRunner = {
        query: async <R = any>(sql: string, params: any[] = []): Promise<R[]> => {
          let psql = sql;
          let paramIndex = 1;
          psql = psql.replace(/\?/g, () => `$${paramIndex++}`);
          const res = await client.query(psql, params);
          return res.rows as R[];
        },
        queryOne: async <R = any>(sql: string, params: any[] = []): Promise<R | null> => {
          const rows = await txRunner.query<R>(sql, params);
          return rows.length > 0 ? rows[0] : null;
        },
        execute: async (sql: string, params: any[] = []): Promise<DbResult> => {
          let psql = sql;
          let paramIndex = 1;
          psql = psql.replace(/\?/g, () => `$${paramIndex++}`);
          const res = await client.query(psql, params);
          return {
            lastInsertId: (res.rows?.[0]?.id as number) || 0,
            changes: res.rowCount || 0,
          };
        },
      };
      const result = await callback(txRunner);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } else {
    const db = getSqliteDb();
    const runInTx = db.transaction(() => {
      // Execute the sync operations
      // Note: for async callbacks in SQLite, we execute within BEGIN ... COMMIT
    });

    db.exec('BEGIN TRANSACTION');
    try {
      const result = await callback({ query, queryOne, execute });
      db.exec('COMMIT');
      return result;
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  }
}

/**
 * Schema Initialization and Seeding
 */
export async function ensureDbInitialized(): Promise<void> {
  if (global.__dbInitialized || global.__dbInitializing) return;
  global.__dbInitializing = true;

  try {
    if (isPostgres) {
      await initPostgresSchema();
    } else {
      initSqliteSchema();
    }

    await seedInitialData();
    global.__dbInitialized = true;
  } finally {
    global.__dbInitializing = false;
  }
}

function initSqliteSchema(): void {
  const db = getSqliteDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS store_settings (
      id INTEGER PRIMARY KEY,
      store_name TEXT NOT NULL DEFAULT 'Roxy Fashion BD',
      tagline_en TEXT NOT NULL DEFAULT 'Contemporary Bangladeshi Elegance',
      tagline_bn TEXT NOT NULL DEFAULT 'সমসাময়িক বাংলাদেশি আভিজাত্য',
      logo_url TEXT,
      favicon_url TEXT,
      phone TEXT NOT NULL DEFAULT '+880 1812-345678',
      email TEXT NOT NULL DEFAULT 'support@roxyfashion.com',
      address_en TEXT NOT NULL DEFAULT 'GEC Circle, Chattogram, Bangladesh',
      address_bn TEXT NOT NULL DEFAULT 'জিইসি মোড়, চট্টগ্রাম, বাংলাদেশ',
      facebook_url TEXT DEFAULT 'https://facebook.com',
      instagram_url TEXT DEFAULT 'https://instagram.com',
      default_delivery_chattogram REAL NOT NULL DEFAULT 80,
      default_delivery_national REAL NOT NULL DEFAULT 150,
      free_delivery_threshold REAL NOT NULL DEFAULT 3000,
      banner_headline_en TEXT DEFAULT 'Festive & Traditional Collection 2026',
      banner_headline_bn TEXT DEFAULT 'উৎসব ও ঐতিহ্যের নতুন সমাহার ২০২৬',
      banner_subheadline_en TEXT DEFAULT 'Handcrafted Premium Panjabi & Designer Womenswear',
      banner_subheadline_bn TEXT DEFAULT 'হাতে তৈরি প্রিমিয়াম পাঞ্জাবি এবং এক্সক্লুসিভ নারী পোশাক',
      hero_image_url TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'support_agent',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_en TEXT NOT NULL,
      name_bn TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      image_url TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subcategories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
      name_en TEXT NOT NULL,
      name_bn TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sizes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS colors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_en TEXT NOT NULL,
      name_bn TEXT NOT NULL,
      hex_code TEXT NOT NULL,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_en TEXT NOT NULL,
      name_bn TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      product_type TEXT NOT NULL DEFAULT 'simple',
      short_description TEXT,
      full_description TEXT,
      sku TEXT NOT NULL UNIQUE,
      regular_price REAL NOT NULL,
      sale_price REAL,
      cost_price REAL,
      main_image TEXT NOT NULL,
      gallery_images TEXT DEFAULT '[]',
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE SET NULL,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      stock_status TEXT NOT NULL DEFAULT 'in_stock',
      status TEXT NOT NULL DEFAULT 'published',
      is_featured INTEGER NOT NULL DEFAULT 0,
      is_bestseller INTEGER NOT NULL DEFAULT 0,
      is_new_arrival INTEGER NOT NULL DEFAULT 1,
      seo_title TEXT,
      seo_description TEXT,
      weight TEXT,
      specifications TEXT DEFAULT '{}',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS product_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      size_id INTEGER REFERENCES sizes(id) ON DELETE RESTRICT,
      color_id INTEGER REFERENCES colors(id) ON DELETE RESTRICT,
      sku TEXT NOT NULL UNIQUE,
      regular_price REAL NOT NULL,
      sale_price REAL,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      image_url TEXT,
      is_enabled INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS districts (
      id INTEGER PRIMARY KEY,
      name_en TEXT NOT NULL,
      name_bn TEXT NOT NULL,
      division TEXT NOT NULL,
      default_delivery_charge REAL NOT NULL DEFAULT 150,
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS district_aliases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      district_id INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
      alias_text TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS delivery_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      district_id INTEGER REFERENCES districts(id) ON DELETE CASCADE,
      zone_name TEXT,
      delivery_charge REAL NOT NULL,
      free_delivery_threshold REAL,
      is_active INTEGER NOT NULL DEFAULT 1,
      effective_from TEXT,
      effective_to TEXT
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      email TEXT,
      delivery_address TEXT,
      total_orders INTEGER NOT NULL DEFAULT 0,
      completed_orders INTEGER NOT NULL DEFAULT 0,
      cancelled_orders INTEGER NOT NULL DEFAULT 0,
      returned_orders INTEGER NOT NULL DEFAULT 0,
      total_spend REAL NOT NULL DEFAULT 0,
      fraud_status TEXT NOT NULL DEFAULT 'clean',
      fraud_notes TEXT,
      marketing_consent INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS blocked_customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL UNIQUE,
      reason TEXT NOT NULL,
      blocked_by TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT NOT NULL UNIQUE,
      public_reference TEXT NOT NULL UNIQUE,
      customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      district_id INTEGER NOT NULL REFERENCES districts(id),
      district_name TEXT NOT NULL,
      delivery_address TEXT NOT NULL,
      order_note TEXT,
      payment_method TEXT NOT NULL DEFAULT 'COD',
      payment_status TEXT NOT NULL DEFAULT 'pending',
      fulfillment_status TEXT NOT NULL DEFAULT 'pending',
      risk_level TEXT NOT NULL DEFAULT 'low',
      subtotal REAL NOT NULL,
      delivery_charge REAL NOT NULL,
      discount_amount REAL NOT NULL DEFAULT 0,
      total_amount REAL NOT NULL,
      coupon_code TEXT,
      staff_notes TEXT,
      assigned_staff_id INTEGER REFERENCES admin_users(id),
      checkout_session_id TEXT,
      ip_address TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
      variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
      product_name TEXT NOT NULL,
      variant_details TEXT,
      sku TEXT NOT NULL,
      unit_price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      total_price REAL NOT NULL,
      image_url TEXT
    );

    CREATE TABLE IF NOT EXISTS inventory_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
      change_quantity INTEGER NOT NULL,
      new_quantity INTEGER NOT NULL,
      reason TEXT NOT NULL,
      reference_order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
      created_by TEXT DEFAULT 'system',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS checkout_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_token TEXT NOT NULL UNIQUE,
      customer_name TEXT,
      customer_phone TEXT,
      district_id INTEGER REFERENCES districts(id),
      delivery_address TEXT,
      order_note TEXT,
      items_snapshot TEXT DEFAULT '[]',
      estimated_total REAL NOT NULL DEFAULT 0,
      checkout_stage TEXT NOT NULL DEFAULT 'contact_entered',
      status TEXT NOT NULL DEFAULT 'abandoned',
      marketing_consent INTEGER NOT NULL DEFAULT 0,
      recovery_notes TEXT,
      order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
      last_active_at TEXT DEFAULT CURRENT_TIMESTAMP,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      discount_type TEXT NOT NULL DEFAULT 'percent',
      discount_value REAL NOT NULL,
      min_order_value REAL NOT NULL DEFAULT 0,
      max_discount REAL,
      usage_limit INTEGER,
      usage_count INTEGER NOT NULL DEFAULT 0,
      start_date TEXT,
      expiry_date TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin_audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_user_id INTEGER REFERENCES admin_users(id),
      admin_name TEXT,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT,
      details TEXT,
      ip_address TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
    CREATE INDEX IF NOT EXISTS idx_orders_reference ON orders(public_reference);
    CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(customer_phone);
    CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
    CREATE INDEX IF NOT EXISTS idx_district_aliases_text ON district_aliases(alias_text);
    CREATE INDEX IF NOT EXISTS idx_checkout_token ON checkout_sessions(session_token);
  `);
}

async function initPostgresSchema(): Promise<void> {
  const pool = getPgPool();
  await pool.query(`
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

    CREATE TABLE IF NOT EXISTS blocked_customers (
      id SERIAL PRIMARY KEY,
      phone VARCHAR(50) NOT NULL UNIQUE,
      reason TEXT NOT NULL,
      blocked_by VARCHAR(100),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

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

    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
    CREATE INDEX IF NOT EXISTS idx_orders_reference ON orders(public_reference);
    CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(customer_phone);
    CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
    CREATE INDEX IF NOT EXISTS idx_district_aliases_text ON district_aliases(alias_text);
    CREATE INDEX IF NOT EXISTS idx_checkout_token ON checkout_sessions(session_token);
  `);
}

/**
 * Seed Initial Data: 64 districts, default admin, initial settings, starter categories, sizes, colors, and products
 */
async function seedInitialData(): Promise<void> {
  // 1. Store settings
  const settingsCount = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM store_settings');
  if (Number(settingsCount?.count || 0) === 0) {
    await execute(`
      INSERT INTO store_settings (
        id, store_name, tagline_en, tagline_bn, phone, email, address_en, address_bn,
        default_delivery_chattogram, default_delivery_national, free_delivery_threshold,
        banner_headline_en, banner_headline_bn, banner_subheadline_en, banner_subheadline_bn
      ) VALUES (
        1, 'Roxy Fashion BD', 'Contemporary Bangladeshi Elegance', 'সমসাময়িক বাংলাদেশি আভিজাত্য',
        '+880 1812-345678', 'support@roxyfashion.com', 'GEC Circle, Chattogram, Bangladesh', 'জিইসি মোড়, চট্টগ্রাম, বাংলাদেশ',
        80, 150, 3000,
        'Festive & Traditional Collection 2026', 'উৎসব ও ঐতিহ্যের নতুন সমাহার ২০২৬',
        'Handcrafted Premium Panjabi & Designer Womenswear', 'হাতে তৈরি প্রিমিয়াম পাঞ্জাবি এবং এক্সক্লুসিভ নারী পোশাক'
      )
    `);
  }

  // 2. Admin users
  const adminCount = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM admin_users');
  if (Number(adminCount?.count || 0) === 0) {
    const defaultPasswordHash = await bcrypt.hash('admin123456', 10);
    await execute(`
      INSERT INTO admin_users (name, email, password_hash, role, is_active)
      VALUES 
        ('Super Admin', 'admin@roxy.com', ?, 'super_admin', 1),
        ('Order Specialist', 'orders@roxy.com', ?, 'order_manager', 1),
        ('Catalogue Manager', 'products@roxy.com', ?, 'product_manager', 1)
    `, [defaultPasswordHash, defaultPasswordHash, defaultPasswordHash]);
  }

  // 3. Bangladesh Districts and Aliases
  const districtCount = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM districts');
  if (Number(districtCount?.count || 0) === 0) {
    for (const d of BANGLADESH_DISTRICTS) {
      await execute(`
        INSERT INTO districts (id, name_en, name_bn, division, default_delivery_charge, is_active)
        VALUES (?, ?, ?, ?, ?, 1)
      `, [d.id, d.name_en, d.name_bn, d.division, d.default_delivery_charge]);

      // Seed aliases
      for (const alias of d.aliases) {
        await execute(`
          INSERT INTO district_aliases (district_id, alias_text)
          VALUES (?, ?)
        `, [d.id, alias.toLowerCase().trim()]);
      }
      // Add exact names as search aliases too
      await execute(`
        INSERT INTO district_aliases (district_id, alias_text)
        VALUES (?, ?), (?, ?)
      `, [d.id, d.name_en.toLowerCase().trim(), d.id, d.name_bn.trim()]);
    }
  }

  // 4. Default Delivery Rules
  const deliveryRulesCount = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM delivery_rules');
  if (Number(deliveryRulesCount?.count || 0) === 0) {
    await execute(`
      INSERT INTO delivery_rules (title, district_id, zone_name, delivery_charge, free_delivery_threshold, is_active)
      VALUES 
        ('Chattogram District Standard Delivery', 1, 'Chattogram Metropolitan & District', 80, 3000, 1),
        ('Nationwide Delivery (Outside Chattogram)', NULL, 'All Bangladesh Districts (Outside Chattogram)', 150, 3500, 1)
    `);
  }

  // 5. Sizes
  const sizeCount = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM sizes');
  if (Number(sizeCount?.count || 0) === 0) {
    const sizes = [
      { name: '38 (S)', order: 1 },
      { name: '40 (M)', order: 2 },
      { name: '42 (L)', order: 3 },
      { name: '44 (XL)', order: 4 },
      { name: '46 (XXL)', order: 5 },
      { name: 'Free Size', order: 6 },
    ];
    for (const s of sizes) {
      await execute('INSERT INTO sizes (name, display_order) VALUES (?, ?)', [s.name, s.order]);
    }
  }

  // 6. Colors
  const colorCount = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM colors');
  if (Number(colorCount?.count || 0) === 0) {
    const colors = [
      { en: 'Deep Maroon', bn: 'গাঢ় মেরুন', hex: '#631322', order: 1 },
      { en: 'Royal Navy', bn: 'রয়েল নেভি ব্লু', hex: '#112244', order: 2 },
      { en: 'Emerald Green', bn: 'পান্না সবুজ', hex: '#134e3b', order: 3 },
      { en: 'Ivory White', bn: 'হাতির দাঁত সাদা', hex: '#FAF9F6', order: 4 },
      { en: 'Midnight Black', bn: 'মিডনাইট ব্ল্যাক', hex: '#1C1917', order: 5 },
      { en: 'Golden Ochre', bn: 'সোনালী হলুদ', hex: '#D4AF37', order: 6 },
      { en: 'Dusty Rose', bn: 'ডাস্টি রোজ', hex: '#C08081', order: 7 },
    ];
    for (const c of colors) {
      await execute('INSERT INTO colors (name_en, name_bn, hex_code, display_order) VALUES (?, ?, ?, ?)', [
        c.en, c.bn, c.hex, c.order
      ]);
    }
  }

  // 7. Categories & Subcategories
  const catCount = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM categories');
  if (Number(catCount?.count || 0) === 0) {
    // Men's Panjabi
    const catMen = await execute(`
      INSERT INTO categories (name_en, name_bn, slug, description, image_url, sort_order, is_active)
      VALUES (
        'Men''s Panjabi & Traditional', 'পুরুষদের পাঞ্জাবি ও ঐতিহ্যবাহী পোশাক', 'mens-panjabi',
        'Handcrafted premium kabli, semi-fitted cotton, silk & jacquard festive panjabis for men.',
        'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80', 1, 1
      )
    `);

    // Women's Clothing
    const catWomen = await execute(`
      INSERT INTO categories (name_en, name_bn, slug, description, image_url, sort_order, is_active)
      VALUES (
        'Women''s Clothing', 'নারীদের পোশাক ও ফ্যাশন', 'womens-clothing',
        'Exclusive designer three-piece, lawn suits, embroidered kurtis, and festive ensembles.',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80', 2, 1
      )
    `);

    // Subcategories
    await execute(`
      INSERT INTO subcategories (category_id, name_en, name_bn, slug, sort_order, is_active)
      VALUES 
        (?, 'Semi-Fitted Cotton Panjabi', 'সেমি-ফিটেড সুতি পাঞ্জাবি', 'cotton-panjabi', 1, 1),
        (?, 'Kabli Set', 'কাবলি সেট', 'kabli-set', 2, 1),
        (?, 'Silk & Jacquard Festive Panjabi', 'সিল্ক ও জ্যাকার্ড পাঞ্জাবি', 'silk-jacquard-panjabi', 3, 1),
        (?, 'Designer Three-Piece', 'ডিজাইনার থ্রি-পিস', 'designer-three-piece', 1, 1),
        (?, 'Embroidered Kurti & Tops', 'এমব্রয়ডারি কুর্তি ও টপস', 'kurti-tops', 2, 1),
        (?, 'Festive Saree & Ensembles', 'উৎসবের শাড়ি ও পোশাক', 'festive-saree', 3, 1)
    `, [catMen.lastInsertId, catMen.lastInsertId, catMen.lastInsertId, catWomen.lastInsertId, catWomen.lastInsertId, catWomen.lastInsertId]);
  }

  // 8. Starter Products with Simple & Variable variants
  const prodCount = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM products');
  if (Number(prodCount?.count || 0) === 0) {
    const menCat = await queryOne<{ id: number }>('SELECT id FROM categories WHERE slug = ?', ['mens-panjabi']);
    const womenCat = await queryOne<{ id: number }>('SELECT id FROM categories WHERE slug = ?', ['womens-clothing']);

    // Variable Product 1: Royal Jacquard Silk Panjabi
    const prod1 = await execute(`
      INSERT INTO products (
        name_en, name_bn, slug, product_type, short_description, full_description, sku,
        regular_price, sale_price, cost_price, main_image, gallery_images,
        category_id, stock_quantity, stock_status, status, is_featured, is_bestseller, is_new_arrival,
        seo_title, seo_description, specifications
      ) VALUES (
        'Royal Embroidered Jacquard Panjabi', 'রয়েল এমব্রয়ডারি জ্যাকার্ড পাঞ্জাবি', 'royal-embroidered-jacquard-panjabi',
        'variable',
        'Exquisite metallic embroidery collar with breathable premium jacquard blend fabric.',
        'Designed for Eid festivals and high-society weddings in Bangladesh. Features delicate zardozi embroidery on collar and placket, high-tensile buttons, and comfort-cut tailoring for all-day elegance.',
        'ROX-PAN-001',
        2850, 2450, 1400,
        'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=900&q=80',
        '["https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=900&q=80","https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&q=80"]',
        ?, 45, 'in_stock', 'published', 1, 1, 1,
        'Royal Embroidered Jacquard Panjabi | Roxy Fashion BD',
        'Buy authentic handcrafted men''s embroidered panjabi with Cash on Delivery all across Bangladesh.',
        '{"Fabric":"Premium Jacquard & Viscose Silk","Collar":"Mandarin with fine zardozi work","Fit":"Modern Semi-Slim","Care":"Dry clean recommended"}'
      )
    `, [menCat?.id]);

    // Add variants for Panjabi (Sizes: 38, 40, 42, 44; Colors: Deep Maroon, Royal Navy, Ivory)
    const size38 = await queryOne<{ id: number }>('SELECT id FROM sizes WHERE name LIKE ?', ['38%']);
    const size40 = await queryOne<{ id: number }>('SELECT id FROM sizes WHERE name LIKE ?', ['40%']);
    const size42 = await queryOne<{ id: number }>('SELECT id FROM sizes WHERE name LIKE ?', ['42%']);
    const size44 = await queryOne<{ id: number }>('SELECT id FROM sizes WHERE name LIKE ?', ['44%']);

    const colMaroon = await queryOne<{ id: number }>('SELECT id FROM colors WHERE hex_code = ?', ['#631322']);
    const colNavy = await queryOne<{ id: number }>('SELECT id FROM colors WHERE hex_code = ?', ['#112244']);
    const colIvory = await queryOne<{ id: number }>('SELECT id FROM colors WHERE hex_code = ?', ['#FAF9F6']);

    const variantsData = [
      { s: size38?.id, c: colMaroon?.id, sku: 'ROX-PAN-001-MRN-38', price: 2450, reg: 2850, qty: 8 },
      { s: size40?.id, c: colMaroon?.id, sku: 'ROX-PAN-001-MRN-40', price: 2450, reg: 2850, qty: 12 },
      { s: size42?.id, c: colMaroon?.id, sku: 'ROX-PAN-001-MRN-42', price: 2450, reg: 2850, qty: 10 },
      { s: size44?.id, c: colMaroon?.id, sku: 'ROX-PAN-001-MRN-44', price: 2450, reg: 2850, qty: 5 },
      { s: size40?.id, c: colNavy?.id, sku: 'ROX-PAN-001-NVY-40', price: 2450, reg: 2850, qty: 10 },
      { s: size42?.id, c: colNavy?.id, sku: 'ROX-PAN-001-NVY-42', price: 2450, reg: 2850, qty: 8 },
      { s: size40?.id, c: colIvory?.id, sku: 'ROX-PAN-001-IVR-40', price: 2550, reg: 2950, qty: 6 },
    ];

    for (const v of variantsData) {
      if (v.s && v.c) {
        await execute(`
          INSERT INTO product_variants (
            product_id, size_id, color_id, sku, regular_price, sale_price, stock_quantity, is_enabled
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        `, [prod1.lastInsertId, v.s, v.c, v.sku, v.reg, v.price, v.qty]);
      }
    }

    // Variable Product 2: Luxury Organza Three-Piece for Women
    const prod2 = await execute(`
      INSERT INTO products (
        name_en, name_bn, slug, product_type, short_description, full_description, sku,
        regular_price, sale_price, cost_price, main_image, gallery_images,
        category_id, stock_quantity, stock_status, status, is_featured, is_bestseller, is_new_arrival,
        seo_title, seo_description, specifications
      ) VALUES (
        'Luxury Hand-Embellished Organza Three-Piece', 'লাক্সারি হ্যান্ড-এমব্রয়ডারি অর্গাঞ্জা থ্রি-পিস', 'luxury-organza-three-piece',
        'variable',
        'Pure organza kameez with intricate resham threadwork, raw silk pants & chiffon dupatta.',
        'An opulent celebration piece crafted for the modern Bangladeshi woman. Features hand-cut scalop borders, delicate threadwork on sleeves, and shimmering sequins that capture festive evening lights flawlessly.',
        'ROX-WOM-001',
        4600, 3950, 2200,
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&q=80',
        '["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&q=80","https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&q=80"]',
        ?, 30, 'in_stock', 'published', 1, 1, 1,
        'Luxury Organza Three Piece Collection | Roxy Fashion BD',
        'Shop designer organza three-piece with Cash on Delivery anywhere in Bangladesh.',
        '{"Kameez Fabric":"Premium Organza with Cotton Inner","Dupatta":"Embroidered Pure Chiffon","Salwar":"Soft Raw Silk (Stitched)","Work":"Resham Thread, Pearls & Sequins"}'
      )
    `, [womenCat?.id]);

    const colRose = await queryOne<{ id: number }>('SELECT id FROM colors WHERE hex_code = ?', ['#C08081']);
    const colEmerald = await queryOne<{ id: number }>('SELECT id FROM colors WHERE hex_code = ?', ['#134e3b']);

    const womenVariants = [
      { s: size38?.id, c: colRose?.id, sku: 'ROX-WOM-001-RSE-38', price: 3950, reg: 4600, qty: 6 },
      { s: size40?.id, c: colRose?.id, sku: 'ROX-WOM-001-RSE-40', price: 3950, reg: 4600, qty: 8 },
      { s: size42?.id, c: colRose?.id, sku: 'ROX-WOM-001-RSE-42', price: 3950, reg: 4600, qty: 7 },
      { s: size40?.id, c: colEmerald?.id, sku: 'ROX-WOM-001-EMR-40', price: 3950, reg: 4600, qty: 5 },
      { s: size42?.id, c: colEmerald?.id, sku: 'ROX-WOM-001-EMR-42', price: 3950, reg: 4600, qty: 4 },
    ];

    for (const v of womenVariants) {
      if (v.s && v.c) {
        await execute(`
          INSERT INTO product_variants (
            product_id, size_id, color_id, sku, regular_price, sale_price, stock_quantity, is_enabled
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        `, [prod2.lastInsertId, v.s, v.c, v.sku, v.reg, v.price, v.qty]);
      }
    }

    // Simple Product 3: Premium Egyptian Cotton Panjabi
    await execute(`
      INSERT INTO products (
        name_en, name_bn, slug, product_type, short_description, full_description, sku,
        regular_price, sale_price, cost_price, main_image, gallery_images,
        category_id, stock_quantity, stock_status, status, is_featured, is_bestseller, is_new_arrival,
        seo_title, specifications
      ) VALUES (
        'Minimalist Egyptian Cotton Black Panjabi', 'মিনিমালিস্ট মিশরীয় সুতি কালো পাঞ্জাবি', 'minimalist-egyptian-cotton-black-panjabi',
        'simple',
        '100% fine Egyptian Giza cotton with tone-on-tone stitch detailing.',
        'A wardrobe essential for Friday prayers, family gatherings, and understated elegance. Supremely soft, moisture-wicking and durable in Bangladesh''s humid climate.',
        'ROX-PAN-002',
        2200, 1850, 1050,
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&q=80',
        '["https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&q=80"]',
        ?, 25, 'in_stock', 'published', 1, 0, 1,
        'Minimalist Egyptian Cotton Panjabi | Roxy Fashion BD',
        '{"Fabric":"100% Egyptian Giza Cotton","Fit":"Regular Comfort","Color":"Jet Black","Buttons":"Mother of Pearl Finish"}'
      )
    `, [menCat?.id]);

    // Simple Product 4: Crimson Lawn Stitched Kurti
    await execute(`
      INSERT INTO products (
        name_en, name_bn, slug, product_type, short_description, full_description, sku,
        regular_price, sale_price, cost_price, main_image, gallery_images,
        category_id, stock_quantity, stock_status, status, is_featured, is_bestseller, is_new_arrival,
        seo_title, specifications
      ) VALUES (
        'Crimson Embroidered Summer Lawn Kurti', 'ক্রিমসন এমব্রয়ডারি সামার লন কুর্তি', 'crimson-embroidered-summer-lawn-kurti',
        'simple',
        'Lightweight digital printed lawn with thread embroidered front panel.',
        'Casual yet chic everyday wear for university, office, and outing. Tailored with clean contemporary silhouette and contrast cuff piping.',
        'ROX-WOM-002',
        1650, 1350, 750,
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&q=80',
        '["https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&q=80"]',
        ?, 40, 'in_stock', 'published', 0, 1, 1,
        'Crimson Embroidered Lawn Kurti | Roxy Fashion BD',
        '{"Fabric":"Super-fine Lawn Cotton","Sleeve":"Full Sleeves with border lace","Wash Care":"Machine wash gentle"}'
      )
    `, [womenCat?.id]);
  }
}
