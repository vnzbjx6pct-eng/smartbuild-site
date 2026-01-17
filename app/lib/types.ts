import { ValidationStatus } from "./productValidator";

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
