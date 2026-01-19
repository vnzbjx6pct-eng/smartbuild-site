import type { ValidationStatus } from "./productValidator";

export type StoreOffer = {
    storeName: string;
    price: number;
    currency: string;
    availability: "Laos" | "Piiratud kogus" | "Tellimisel";
    logoColor: string;
};

export interface Product {
    id: string;
    // UI rendering: t(genericNameKey) + (brand ? " " + brand : "") + (specification ? " " + specification : "")
    genericNameKey: string;     // e.g. "prod_gypsum_standard" -> "Kipsplaat"
    brand?: string;             // e.g. "Gyproc", "Knauf" (Keeping as-is)
    specification?: string;     // e.g. "12.5mm 1200x2500" or "GN 13"

    // Logistics (Optional - used for Delivery Eligibility)
    weightKg?: number;          // Single unit weight
    volumeM3?: number;          // Single unit volume
    lengthCm?: number;          // New: Side 1
    widthCm?: number;           // New: Side 2
    heightCm?: number;          // New: Side 3
    deliveryAllowedWolt?: boolean; // New: Manual override
    bulky?: boolean;            // True if dimensions exceed standard courier limits (e.g. > 1.2m)
    fragile?: boolean;          // True if requires special handling (glass, ceramics)
    deliveryClass?: "small" | "medium" | "heavy" | "oversize"; // Logistics class
    hazmat?: boolean;           // True if hazardous (paint, chemicals)

    // Fallback/Legacy
    name: string;               // Keeping for now to avoid break, but should use above in UI

    // Categories
    categoryKey: string;        // e.g. "cat_construction" -> "Üldehitus"
    subcategoryKey?: string;    // e.g. "sub_drywall" -> "Kipsplaadid"
    category: string;           // Legacy fallback

    unit: string;               // Legacy fallback
    unitKey?: string;           // e.g. "unit_pcs", "unit_pack"
    unitLabel?: string;
    image: string;
    offers: StoreOffer[];
    // Quality Gate Fields
    status?: ValidationStatus;
    qualityScore?: number;
    rejectionReasons?: string[];
}

export interface Store {
    id: string;
    name: string;
    brand_name: string;
    city: string;
    address: string;
    contact_email: string;
    phone: string;
    status: 'active' | 'pending' | 'disabled';
}

export type StoreRole = 'partner_admin' | 'partner_manager' | 'platform_admin';

export interface StoreUser {
    user_id: string;
    store_id: string;
    role: StoreRole;
}

export interface StoreProduct {
    id: string;
    store_id: string;
    product_master_id?: string;
    name_override_et?: string;
    name_override_ru?: string;
    brand: string;
    sku?: string;
    ean?: string;
    price: number;
    currency: string;
    stock_status: 'in_stock' | 'out_of_stock' | 'limited' | 'preorder';
    stock_qty?: number;

    // Logistics
    weight_kg?: number;
    length_cm?: number;
    width_cm?: number;
    height_cm?: number;
    hazmat: boolean;
    missing_dimensions: boolean;

    // Toggles
    delivery_allowed_wolt: boolean;
    pickup_allowed: boolean;
    store_delivery_allowed: boolean;

    image_url?: string;
    updated_at: string;
}

export interface ImportJob {
    id: string;
    store_id: string;
    status: 'uploaded' | 'previewed' | 'applied' | 'failed';
    file_name: string;
    mapping_json: Record<string, string>;
    summary_json: {
        total_rows?: number;
        valid_rows?: number;
        error_rows?: number;
        created_count?: number;
        updated_count?: number;
    };
    errors_json: Array<{ row: number; error: string; data?: any }>;
    created_at: string;
}

export interface StoreDeliverySettings {
    store_id: string;
    pickup_enabled: boolean;
    wolt_enabled: boolean;
    store_delivery_enabled: boolean;
    cities: string[];
    prep_time_min: number;
    partial_delivery_enabled: boolean;
    store_delivery_rules_json: {
        min_order_eur?: number;
        fee_eur?: number;
        free_shipping_from_eur?: number;
    };
}

// User Dashboard Types
export interface UserProfile {
    id: string; // auth.uid
    full_name: string;
    phone: string;
    default_city: string;
}

export type OrderStatus = 'draft' | 'submitted' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface Order {
    id: string;
    user_id: string;
    status: OrderStatus;
    payment_status: PaymentStatus;
    currency: string;
    subtotal: number;
    delivery_fee: number;
    total: number;
    city: string;
    address_line: string;
    phone: string;
    notes?: string;
    created_at: string;
    // Relations
    items?: OrderItem[];
    shipments?: Shipment[];
}

export interface OrderItem {
    id: string;
    order_id: string;
    store_id?: string;
    product_id: string;
    name: string;
    brand?: string;
    qty: number;
    unit?: string;
    price: number;
    line_total: number;
    image_url?: string;
    shipment_id?: string;
}

export type ShipmentType = 'wolt' | 'store_delivery' | 'pickup';
export type ShipmentStatus = 'pending' | 'quoted' | 'accepted' | 'preparing' | 'dispatched' | 'delivered' | 'failed' | 'cancelled';

export interface Shipment {
    id: string;
    order_id: string;
    type: ShipmentType;
    status: ShipmentStatus;
    store_id?: string;
    city?: string;
    address_line?: string;
    eta_minutes?: number;
    fee: number;
    provider?: string;
    provider_reference?: string;
    // Reason Codes
    status_reason_code?: string;
    status_reason_details?: string;

    created_at: string;
    // Relations
    events?: ShipmentEvent[];
}

export interface ShipmentEvent {
    id: string;
    shipment_id: string;
    event_status: string;
    message?: string;
    reason_code?: string;
    visibility?: 'public' | 'internal';
    created_at: string;
}

export interface NotificationSettings {
    user_id: string;
    email_enabled: boolean;
    inapp_enabled: boolean;
    notify_all_updates: boolean;
    quiet_hours_start?: number;
    quiet_hours_end?: number;
    language_preference?: 'et' | 'ru';
    created_at: string;
    updated_at: string;
}

export interface Notification {
    id: string;
    user_id: string;
    type: 'order_submitted' | 'shipment_status' | 'eta_change' | 'action_required' | 'partial_delivery' | 'system';
    severity: 'info' | 'warning' | 'action_required' | 'error';
    title_key?: string;
    body_key?: string;
    title_text?: string;
    body_text?: string;
    payload?: any;
    is_read: boolean;
    channels: string[];
    dedup_key?: string;
    created_at: string;
}

export interface NotificationEvent {
    id: string;
    notification_id: string;
    channel: 'inapp' | 'email';
    status: 'queued' | 'sent' | 'failed';
    provider?: string;
    provider_id?: string;
    error?: string;
    created_at: string;
}
