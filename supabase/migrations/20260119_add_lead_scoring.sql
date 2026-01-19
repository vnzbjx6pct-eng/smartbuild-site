-- Add lead scoring fields to partners_contacts table
ALTER TABLE public.partners_contacts
ADD COLUMN IF NOT EXISTS lead_score integer,
ADD COLUMN IF NOT EXISTS lead_tier text CHECK (lead_tier IN ('hot', 'warm', 'cold')),
ADD COLUMN IF NOT EXISTS lead_score_reason text[]; -- Array of reasons
