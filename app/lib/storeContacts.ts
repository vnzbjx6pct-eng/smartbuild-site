import { STORES, type StoreName } from "./stores";

// ---------------------------------------------------------------------------
// ARCHITECTURE EXPLANATION (Future-Proofing for SmartBuild)
// ---------------------------------------------------------------------------
// 1. ENTITIES:
//    - Brand: Global chain (e.g. Espak).
//    - City: Geographic context. Routing starts here.
//    - StoreLocation: Intersection of Brand + City.
//    - Manager: Person responsible for quotes. Assigned to ONE Location.
//
// 2. ROUTING LOGIC:
//    User picks City -> System filters Brands in that City -> System finds StoreLocation
//    -> System Load Balances among Active Managers of that Location.
//
// 3. SCALING:
//    - Adding a city (e.g. Narva) = Add City ID + Add StoreLocations.
//    - Adding a manager = Add Manager ID (linked to Location).
// ---------------------------------------------------------------------------

// --- 1. CORE TYPES ---

export type BrandId = string; // e.g., 'espak'
export type CityId = string;  // e.g., 'parnu'
export type LocationId = string; // e.g., 'espak-parnu'
export type ManagerId = string; // e.g., 'mgr-espak-parnu-1'

export interface Brand {
    id: BrandId;
    name: StoreName;
    website: string;
}

export interface City {
    id: CityId;
    name: string;
    slug: string;
    isActive: boolean;
}

export interface StoreLocation {
    id: LocationId;
    brandId: BrandId;
    cityId: CityId;
    address?: string;
    generalEmail: string; // Fallback if managers busy/inactive
    isActive: boolean;
}

export interface Manager {
    id: ManagerId;
    locationId: LocationId;
    name: string;
    email: string;
    status: 'ACTIVE' | 'VACATION' | 'INACTIVE';
    lastAssigned?: number; // For Load Balancing
}

// --- 2. DATA REGISTRIES (Normalized) ---
// [DATA SOURCE NOTE]
// Currently, these arrays act as our "Database".
// To scale to 100+ locations, replace these const exports with async calls to 
// Supabase/PostgreSQL (e.g., await db.from('store_locations').select('*')).

export const BRANDS: Brand[] = [
    { id: 'ehituse_abc', name: 'Ehituse ABC', website: 'https://ehituseabc.ee' },
    { id: 'bauhof', name: 'Bauhof', website: 'https://www.bauhof.ee' },
    { id: 'k_rauta', name: 'K-Rauta', website: 'https://www.k-rauta.ee' },
    { id: 'espak', name: 'Espak', website: 'https://espak.ee' },
    { id: 'decora', name: 'Decora', website: 'https://www.decora.ee' },
    { id: 'karl_bilder', name: 'Karl Bilder', website: 'https://www.karlbilder.ee' },
];

export const CITIES: City[] = [
    { id: 'parnu', name: 'Pärnu', slug: 'parnu', isActive: true },
    { id: 'tallinn', name: 'Tallinn', slug: 'tallinn', isActive: true },
    { id: 'tartu', name: 'Tartu', slug: 'tartu', isActive: true },
];

// Locations Registry - The "Router" Table
export const STORE_LOCATIONS: StoreLocation[] = [
    // PÄRNU
    { id: 'abc-parnu', brandId: 'ehituse_abc', cityId: 'parnu', generalEmail: 'parnu@ehituseabc.ee', isActive: true },
    { id: 'bauhof-parnu', brandId: 'bauhof', cityId: 'parnu', generalEmail: 'parnu@bauhof.ee', isActive: true },
    { id: 'krauta-parnu', brandId: 'k_rauta', cityId: 'parnu', generalEmail: 'parnu.kauplus@kesko.ee', isActive: true },
    { id: 'espak-parnu', brandId: 'espak', cityId: 'parnu', generalEmail: 'parnu@espak.ee', isActive: true },
    { id: 'decora-parnu', brandId: 'decora', cityId: 'parnu', generalEmail: 'parnu@decora.ee', isActive: true },
    { id: 'kb-parnu', brandId: 'karl_bilder', cityId: 'parnu', generalEmail: 'parnu@karlbilder.ee', isActive: true },

    // TALLINN
    { id: 'abc-tallinn', brandId: 'ehituse_abc', cityId: 'tallinn', generalEmail: 'tallinn@ehituseabc.ee', isActive: true },
    { id: 'bauhof-tallinn', brandId: 'bauhof', cityId: 'tallinn', generalEmail: 'tallinn@bauhof.ee', isActive: true },
    { id: 'krauta-tallinn', brandId: 'k_rauta', cityId: 'tallinn', generalEmail: 'tallinn@kesko.ee', isActive: true },
    { id: 'espak-tallinn', brandId: 'espak', cityId: 'tallinn', generalEmail: 'tallinn@espak.ee', isActive: true },
    { id: 'decora-tallinn', brandId: 'decora', cityId: 'tallinn', generalEmail: 'tallinn@decora.ee', isActive: true },
    { id: 'kb-tallinn', brandId: 'karl_bilder', cityId: 'tallinn', generalEmail: 'tallinn@karlbilder.ee', isActive: true },

    // TARTU
    { id: 'abc-tartu', brandId: 'ehituse_abc', cityId: 'tartu', generalEmail: 'tartu@ehituseabc.ee', isActive: true },
    { id: 'bauhof-tartu', brandId: 'bauhof', cityId: 'tartu', generalEmail: 'tartu@bauhof.ee', isActive: true },
    { id: 'krauta-tartu', brandId: 'k_rauta', cityId: 'tartu', generalEmail: 'tartu@kesko.ee', isActive: true },
    { id: 'espak-tartu', brandId: 'espak', cityId: 'tartu', generalEmail: 'tartu@espak.ee', isActive: true },
    { id: 'decora-tartu', brandId: 'decora', cityId: 'tartu', generalEmail: 'tartu@decora.ee', isActive: true },
    { id: 'kb-tartu', brandId: 'karl_bilder', cityId: 'tartu', generalEmail: 'tartu@karlbilder.ee', isActive: true },
];

// Managers Registry (Example)
// Scaling: To add a manager, append here linked to a locationId
export const MANAGERS: Manager[] = [
    // Pärnu Example Managers
    { id: 'mgr-abc-parnu-1', locationId: 'abc-parnu', name: 'Müügiosakond', email: 'parnu@ehituseabc.ee', status: 'ACTIVE' },
    // Other managers would go here...
];

// --- 3. EXPORTS & HELPERS ---

export const SUPPORTED_CITIES = CITIES.map(c => c.name);
export type CityName = (typeof SUPPORTED_CITIES)[number];

export const SUPPORTED_STORES = STORES;
export { StoreName };

// Backward Compatibility Generator
// This reconstructs the simple { City: { Brand: Email } } object the app currently uses
// from the normalized data model.
export const CONTACTS_BY_CITY: Record<string, Record<StoreName, string>> = {};

CITIES.forEach(city => {
    CONTACTS_BY_CITY[city.name] = {} as Record<StoreName, string>;

    // Find all locations for this city
    const cityLocations = STORE_LOCATIONS.filter(loc => loc.cityId === city.id);

    cityLocations.forEach(loc => {
        // Find brand name
        const brand = BRANDS.find(b => b.id === loc.brandId);
        if (brand) {
            // Logic: In future, we pick a Manager here. For now, use general email.
            CONTACTS_BY_CITY[city.name][brand.name] = loc.generalEmail;
        }
    });
});

export const DEFAULT_CONTACTS: Record<StoreName, string> = {
    "Ehituse ABC": "info@ehituseabc.ee",
    "Bauhof": "info@bauhof.ee",
    "K-Rauta": "klienditugi@kesko.ee",
    "Espak": "info@espak.ee",
    "Decora": "info@decora.ee",
    "Karl Bilder": "info@karlbilder.ee",
};
