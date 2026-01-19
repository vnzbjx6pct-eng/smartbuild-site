-- Add reason codes to shipments
ALTER TABLE shipments 
ADD COLUMN IF NOT EXISTS status_reason_code text,
ADD COLUMN IF NOT EXISTS status_reason_details text;

-- Add reason codes and visibility to shipment_events
ALTER TABLE shipment_events 
ADD COLUMN IF NOT EXISTS reason_code text,
ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'public' CHECK (visibility IN ('public', 'internal'));

-- Comment on columns
COMMENT ON COLUMN shipments.status_reason_code IS 'Stable code for delivery issues/delays (e.g. COURIER_OVERLOAD)';
COMMENT ON COLUMN shipment_events.visiblity IS 'Controls if the customer can see this event';
