-- Migration: Consolidate partner_products into products
-- Reason: Fix broken data model where import wrote to one table and UI read from another.

BEGIN;

-- 1. Extend products table with missing fields
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS sku text,
ADD COLUMN IF NOT EXISTS ean text,
ADD COLUMN IF NOT EXISTS unit text DEFAULT 'pcs',
ADD COLUMN IF NOT EXISTS subcategory text,
ADD COLUMN IF NOT EXISTS image_url text, -- Ensure this exists
ADD COLUMN IF NOT EXISTS delivery_days integer,
ADD COLUMN IF NOT EXISTS categorization_confidence numeric,
ADD COLUMN IF NOT EXISTS normalized_category text,
ADD COLUMN IF NOT EXISTS normalized_subcategory text;

-- 2. Migrate data from partner_products to products
-- We join with partner_stores to get the owner_id (partner_id)
INSERT INTO public.products (
    partner_id,
    name,
    description,
    price,
    stock,
    category,
    subcategory,
    unit,
    sku,
    ean,
    created_at,
    updated_at
)
SELECT 
    ps.owner_id as partner_id,
    pp.product_name as name,
    pp.description,
    pp.price,
    pp.stock,
    pp.category,
    pp.subcategory,
    COALESCE(pp.unit, 'pcs'),
    pp.sku,
    pp.ean,
    pp.created_at,
    pp.updated_at
FROM public.partner_products pp
JOIN public.partner_stores ps ON pp.store_id = ps.id
-- Avoid duplicates based on SKU if possible, or just insert all for MVP
WHERE NOT EXISTS (
    SELECT 1 FROM public.products p 
    WHERE p.partner_id = ps.owner_id 
    AND (p.sku = pp.sku OR p.name = pp.product_name)
);

-- 3. Update RLS Policies for products
-- Ensure partners can manage their own products
DROP POLICY IF EXISTS "Partners can manage their own products" ON public.products;
CREATE POLICY "Partners can manage their own products"
ON public.products
FOR ALL
USING (auth.uid() = partner_id)
WITH CHECK (auth.uid() = partner_id);

-- Ensure public can read active products
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products"
ON public.products
FOR SELECT
USING (is_active = true);

-- Add missing RLS policy for ORDERS (per audit findings)
CREATE POLICY "Customers can insert orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 4. Drop the redundant table (Optional: keep for backup if needed, but better to clean up)
-- DROP TABLE public.partner_products; 
-- Keeping it commented out for safety, user can decide to drop later.

COMMIT;
