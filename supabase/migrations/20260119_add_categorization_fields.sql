-- Add categorization fields to partner_products table
ALTER TABLE public.partner_products
ADD COLUMN IF NOT EXISTS normalized_category text,
ADD COLUMN IF NOT EXISTS normalized_subcategory text,
ADD COLUMN IF NOT EXISTS categorization_confidence decimal(3,2),
ADD COLUMN IF NOT EXISTS categorization_reason text;

-- Update RLS policies if needed (existing ones cover updates, but good to check)
-- No changes needed to policies as standard update covers all columns usually.
