-- Partner MVP Migration
-- This migration adds partner functionality to the existing schema
-- It does NOT drop existing tables, only extends them

-- ======================================
-- 1. EXTEND PROFILES TABLE
-- ======================================

-- Add role column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user' 
            CHECK (role IN ('user', 'partner', 'admin'));
    END IF;
END $$;

-- Add store_name column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'store_name') THEN
        ALTER TABLE profiles ADD COLUMN store_name TEXT;
    END IF;
END $$;

-- Add store_slug column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'store_slug') THEN
        ALTER TABLE profiles ADD COLUMN store_slug TEXT UNIQUE;
    END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- ======================================
-- 2. CREATE UPDATED_AT TRIGGER
-- ======================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- ======================================
-- 3. CREATE HANDLE_NEW_USER FUNCTION
-- ======================================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, created_at)
    VALUES (NEW.id, NEW.email, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ======================================
-- 4. CREATE PARTNER PRODUCTS TABLE
-- ======================================

CREATE TABLE IF NOT EXISTS partner_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    unit TEXT DEFAULT 'tk',
    price DECIMAL(10,2),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster partner queries
CREATE INDEX IF NOT EXISTS idx_partner_products_partner_id ON partner_products(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_products_is_active ON partner_products(is_active);

-- Trigger for partner_products updated_at
DROP TRIGGER IF EXISTS update_partner_products_updated_at ON partner_products;
CREATE TRIGGER update_partner_products_updated_at
    BEFORE UPDATE ON partner_products
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- ======================================
-- 5. CREATE ORDERS TABLE
-- ======================================

CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    partner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    total_amount DECIMAL(10,2) DEFAULT 0,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    delivery_address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_partner_id ON orders(partner_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Trigger for orders updated_at
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- ======================================
-- 6. CREATE ORDER_ITEMS TABLE
-- ======================================

CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES partner_products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for order_items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- ======================================
-- 7. RLS POLICIES
-- ======================================

-- Enable RLS on new tables
ALTER TABLE partner_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Profiles policies (update existing)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" 
    ON profiles FOR SELECT 
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" 
    ON profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Partner Products policies
DROP POLICY IF EXISTS "Partners can view own products" ON partner_products;
CREATE POLICY "Partners can view own products" 
    ON partner_products FOR SELECT 
    USING (auth.uid() = partner_id);

DROP POLICY IF EXISTS "Partners can insert own products" ON partner_products;
CREATE POLICY "Partners can insert own products" 
    ON partner_products FOR INSERT 
    WITH CHECK (auth.uid() = partner_id);

DROP POLICY IF EXISTS "Partners can update own products" ON partner_products;
CREATE POLICY "Partners can update own products" 
    ON partner_products FOR UPDATE 
    USING (auth.uid() = partner_id);

DROP POLICY IF EXISTS "Partners can delete own products" ON partner_products;
CREATE POLICY "Partners can delete own products" 
    ON partner_products FOR DELETE 
    USING (auth.uid() = partner_id);

DROP POLICY IF EXISTS "Public can view active products" ON partner_products;
CREATE POLICY "Public can view active products" 
    ON partner_products FOR SELECT 
    USING (is_active = true);

-- Orders policies
DROP POLICY IF EXISTS "Users can view own orders as customer" ON orders;
CREATE POLICY "Users can view own orders as customer" 
    ON orders FOR SELECT 
    USING (auth.uid() = user_id OR auth.uid() = partner_id);

DROP POLICY IF EXISTS "Partners can update own orders" ON orders;
CREATE POLICY "Partners can update own orders" 
    ON orders FOR UPDATE 
    USING (auth.uid() = partner_id);

DROP POLICY IF EXISTS "Authenticated users can create orders" ON orders;
CREATE POLICY "Authenticated users can create orders" 
    ON orders FOR INSERT 
    TO authenticated
    WITH CHECK (true);

-- Order Items policies (inherit from orders)
DROP POLICY IF EXISTS "Users can view order items" ON order_items;
CREATE POLICY "Users can view order items" 
    ON order_items FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND (orders.user_id = auth.uid() OR orders.partner_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Authenticated users can insert order items" ON order_items;
CREATE POLICY "Authenticated users can insert order items" 
    ON order_items FOR INSERT 
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- ======================================
-- 8. SEED DATA (OPTIONAL TEST PARTNER)
-- ======================================

-- This will be commented out - you can create a test partner account manually
-- through the app's registration flow or Supabase dashboard

/*
-- Example: Create a test partner user
-- First create the user in Supabase Auth Dashboard, then:
UPDATE profiles 
SET role = 'partner', 
    store_name = 'Test Materials Store', 
    store_slug = 'test-store'
WHERE email = 'partner@test.com';
*/
