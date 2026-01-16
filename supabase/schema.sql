-- Drop tables if they exist to reset (CASCADE to remove relations)
DROP TABLE IF EXISTS rfq_recipients CASCADE;
DROP TABLE IF EXISTS rfq_items CASCADE;
DROP TABLE IF EXISTS rfq_requests CASCADE;
DROP TABLE IF EXISTS offers CASCADE;
DROP TABLE IF EXISTS branches CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 1. PROFILES (Extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  company_name TEXT,
  city TEXT, -- 'Pärnu', 'Tallinn', 'Tartu' etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. BRANDS (Retail Chains)
CREATE TABLE brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- 'espak', 'bauhof'
  website TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. BRANCHES (Physical Stores with City logic)
CREATE TABLE branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  city TEXT NOT NULL, -- 'Pärnu', 'Tallinn'
  address TEXT,
  rfq_email TEXT NOT NULL, -- Email to send RFQs to (e.g. parnu@espak.ee)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PRODUCTS (Catalog)
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT, -- 'General Construction', 'Finishing', etc.
  unit TEXT, -- 'tk', 'm2', 'pack'
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. OFFERS (Prices)
CREATE TABLE offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  url TEXT, -- Link to product on store website
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, brand_id) -- One offer per brand per product (simplified)
);

-- 6. RFQ REQUESTS (The "Cart" request)
CREATE TABLE rfq_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id), -- Optional for MVP, but good for history
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  delivery_city TEXT NOT NULL, -- Driving the routing
  delivery_address TEXT,
  comment TEXT,
  status TEXT DEFAULT 'sent', -- 'sent', 'partial_reply', 'closed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. RFQ ITEMS (Line items)
CREATE TABLE rfq_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_request_id UUID REFERENCES rfq_requests(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  qty DECIMAL(10,2) NOT NULL,
  unit TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. RFQ RECIPIENTS (Tracking which stores got the email)
CREATE TABLE rfq_recipients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_request_id UUID REFERENCES rfq_requests(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'sent' -- 'sent', 'failed'
);

-- RLS POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfq_requests ENABLE ROW LEVEL SECURITY;

-- Public Read Access
CREATE POLICY "Public profiles read" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public brands read" ON brands FOR SELECT USING (true);
CREATE POLICY "Public branches read" ON branches FOR SELECT USING (true);
CREATE POLICY "Public products read" ON products FOR SELECT USING (true);
CREATE POLICY "Public offers read" ON offers FOR SELECT USING (true);

-- Authenticated Users can create RFQs
CREATE POLICY "Auth users create RFQ" ON rfq_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users read own RFQ" ON rfq_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Profiles: User can update own profile
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- SEED DATA --

-- Brands
INSERT INTO brands (name, slug) VALUES 
('Espak', 'espak'),
('Bauhof', 'bauhof'),
('Decora', 'decora'),
('K-Rauta', 'k-rauta'),
('Ehituse ABC', 'ehituse-abc');

-- Branches (Mock Emails for Pärnu)
DO $$
DECLARE
  espak_id UUID;
  bauhof_id UUID;
  decora_id UUID;
  krauta_id UUID;
  ehitusabc_id UUID;
BEGIN
  SELECT id INTO espak_id FROM brands WHERE slug = 'espak';
  SELECT id INTO bauhof_id FROM brands WHERE slug = 'bauhof';
  SELECT id INTO decora_id FROM brands WHERE slug = 'decora';
  SELECT id INTO krauta_id FROM brands WHERE slug = 'k-rauta';
  SELECT id INTO ehitusabc_id FROM brands WHERE slug = 'ehituse-abc';

  -- PÄRNU BRANCHES
  INSERT INTO branches (brand_id, city, address, rfq_email) VALUES
  (espak_id, 'Pärnu', 'Papiniidu 4', 'parnu@espak.ee'), -- Mock
  (bauhof_id, 'Pärnu', 'Papiniidu 5', 'parnu@bauhof.ee'),
  (decora_id, 'Pärnu', 'Lai 10', 'parnu@decora.ee'),
  (krauta_id, 'Pärnu', 'Papiniidu 8', 'parnu@k-rauta.ee'),
  (ehitusabc_id, 'Pärnu', 'Riia mnt 108', 'parnu@ehituseabc.ee');

  -- TALLINN BRANCHES (Example)
  INSERT INTO branches (brand_id, city, address, rfq_email) VALUES
  (espak_id, 'Tallinn', 'Viadukti 42', 'tallinn@espak.ee');
END $$;

-- Products & Offers
DO $$
DECLARE
  prod_gypsum UUID;
  prod_wool UUID;
  prod_osb UUID;
  espak_id UUID;
  bauhof_id UUID;
  decora_id UUID;
  krauta_id UUID;
BEGIN
  SELECT id INTO espak_id FROM brands WHERE slug = 'espak';
  SELECT id INTO bauhof_id FROM brands WHERE slug = 'bauhof';
  SELECT id INTO decora_id FROM brands WHERE slug = 'decora';
  SELECT id INTO krauta_id FROM brands WHERE slug = 'k-rauta';

  -- Product 1: Gypsum
  INSERT INTO products (name, category, unit, image_url) VALUES 
  ('Kipsplaat Knauf White 12.5mm 1.2x2.6m', 'Üldehitus', 'tk', 'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?auto=format&fit=crop&q=80&w=600')
  RETURNING id INTO prod_gypsum;

  INSERT INTO offers (product_id, brand_id, price) VALUES
  (prod_gypsum, espak_id, 8.50),
  (prod_gypsum, bauhof_id, 9.20),
  (prod_gypsum, decora_id, 8.95),
  (prod_gypsum, krauta_id, 9.10);

  -- Product 2: Wool
  INSERT INTO products (name, category, unit, image_url) VALUES 
  ('Kivivill Isover Premium 33 100mm', 'Soojustus', 'pak', 'https://images.unsplash.com/photo-1628151015968-3a45c63e2642?auto=format&fit=crop&q=80&w=600')
  RETURNING id INTO prod_wool;

  INSERT INTO offers (product_id, brand_id, price) VALUES
  (prod_wool, espak_id, 24.50),
  (prod_wool, bauhof_id, 26.00),
  (prod_wool, decora_id, 25.50);

  -- Product 3: OSB
  INSERT INTO products (name, category, unit, image_url) VALUES 
  ('OSB-3 plaat 12mm 2500x1250mm', 'Üldehitus', 'tk', 'https://images.unsplash.com/photo-1518709328224-e0e64c67315a?auto=format&fit=crop&q=80&w=600')
  RETURNING id INTO prod_osb;

  INSERT INTO offers (product_id, brand_id, price) VALUES
  (prod_osb, espak_id, 14.50),
  (prod_osb, krauta_id, 15.20);

END $$;
