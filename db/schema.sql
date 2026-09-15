-- Bridal Atelier - SQLite schema
-- Dùng node:sqlite (built-in Node.js >= 22.5) — không cần cài driver ngoài, không cần build native binary,
-- giúp việc "upload lên hosting" đơn giản: chỉ cần Node.js là chạy được, không phụ thuộc mạng khi cài đặt.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('BRIDE','GROOM')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('BRIDE','GROOM')),
  short_description TEXT,
  description TEXT NOT NULL DEFAULT '',
  price REAL NOT NULL DEFAULT 0,
  compare_at_price REAL,
  is_featured INTEGER NOT NULL DEFAULT 0,
  is_new INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1,
  is_tryon_enabled INTEGER NOT NULL DEFAULT 1,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  meta_title TEXT,
  meta_description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS product_images (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS materials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  swatch_image_url TEXT,
  extra_price REAL NOT NULL DEFAULT 0,
  ai_prompt_tag TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS product_materials (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  material_id TEXT NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  UNIQUE(product_id, material_id)
);

CREATE TABLE IF NOT EXISTS style_options (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  extra_price REAL NOT NULL DEFAULT 0,
  ai_prompt_tag TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS product_styles (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  style_id TEXT NOT NULL REFERENCES style_options(id) ON DELETE CASCADE,
  UNIQUE(product_id, style_id)
);

CREATE TABLE IF NOT EXISTS color_options (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  hex_code TEXT NOT NULL DEFAULT '#FFFFFF',
  extra_price REAL NOT NULL DEFAULT 0,
  ai_prompt_tag TEXT,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS product_colors (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_id TEXT NOT NULL REFERENCES color_options(id) ON DELETE CASCADE,
  UNIQUE(product_id, color_id)
);

CREATE TABLE IF NOT EXISTS size_options (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product_sizes (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size_id TEXT NOT NULL REFERENCES size_options(id) ON DELETE CASCADE,
  UNIQUE(product_id, size_id)
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  address TEXT,
  note TEXT,
  source TEXT NOT NULL DEFAULT 'website',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  preferred_date TEXT NOT NULL,
  preferred_time TEXT NOT NULL,
  appointment_type TEXT NOT NULL DEFAULT 'fitting',
  message TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','CONFIRMED','COMPLETED','CANCELLED')),
  deposit_required REAL NOT NULL DEFAULT 0,
  deposit_paid INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_code TEXT NOT NULL UNIQUE,
  customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT,
  note TEXT,
  subtotal REAL NOT NULL DEFAULT 0,
  shipping_fee REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING_PAYMENT' CHECK (status IN ('PENDING_PAYMENT','PAYMENT_CONFIRMED','PROCESSING','SHIPPED','COMPLETED','CANCELLED')),
  payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
  payment_proof_url TEXT,
  payment_confirmed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,
  variant_label TEXT,
  unit_price REAL NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  line_total REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS tryon_requests (
  id TEXT PRIMARY KEY,
  request_code TEXT NOT NULL UNIQUE,
  customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
  product_id TEXT NOT NULL REFERENCES products(id),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  selected_style TEXT,
  selected_material TEXT,
  selected_color TEXT,
  customer_photo_url TEXT NOT NULL,
  result_image_url TEXT,
  fee REAL NOT NULL DEFAULT 0,
  payment_proof_url TEXT,
  payment_confirmed_at TEXT,
  status TEXT NOT NULL DEFAULT 'AWAITING_PAYMENT' CHECK (status IN ('AWAITING_PAYMENT','PAYMENT_CONFIRMED','PROCESSING','COMPLETED','FAILED')),
  ai_provider TEXT,
  ai_error TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS blog_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  cover_image_url TEXT,
  content_html TEXT NOT NULL DEFAULT '',
  category_id TEXT REFERENCES blog_categories(id) ON DELETE SET NULL,
  author TEXT NOT NULL DEFAULT 'Bridal Atelier',
  is_published INTEGER NOT NULL DEFAULT 1,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  reading_minutes INTEGER NOT NULL DEFAULT 5,
  published_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'singleton',
  site_name TEXT NOT NULL DEFAULT 'TomQ Bridal',
  logo_url TEXT,
  favicon_url TEXT,
  color_primary TEXT NOT NULL DEFAULT '#8B6F57',
  color_secondary TEXT NOT NULL DEFAULT '#EFE6DC',
  color_accent TEXT NOT NULL DEFAULT '#C9A15B',
  color_dark TEXT NOT NULL DEFAULT '#2B2622',
  currency_code TEXT NOT NULL DEFAULT 'AUD',
  currency_locale TEXT NOT NULL DEFAULT 'en-AU',
  phone TEXT NOT NULL DEFAULT '+61 404 837 888',
  email TEXT NOT NULL DEFAULT 'info@tomqbridal.com',
  address TEXT NOT NULL DEFAULT '359 Parramatta Road, Leichhardt NSW 2040, Australia',
  facebook_url TEXT,
  instagram_url TEXT,
  zalo_url TEXT,
  bank_name TEXT NOT NULL DEFAULT '',
  bank_account_name TEXT NOT NULL DEFAULT 'T Nguyen',
  bank_account_number TEXT NOT NULL DEFAULT '27036894',
  bank_branch TEXT NOT NULL DEFAULT '',
  bank_bsb TEXT NOT NULL DEFAULT '067872',
  bank_qr_image_url TEXT,
  default_shipping_fee REAL NOT NULL DEFAULT 20,
  free_shipping_threshold REAL NOT NULL DEFAULT 500,
  tryon_fee REAL NOT NULL DEFAULT 29,
  appointment_deposit REAL NOT NULL DEFAULT 50,
  home_content_json TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
