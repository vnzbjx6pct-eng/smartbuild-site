import {
    BRANDS,
    CITIES,
    STORE_LOCATIONS,
    MANAGERS,
    type CityName,
    type StoreName,
    type Manager,
    type StoreLocation,
    type ManagerId
} from "./storeContacts";

// In-Memory state for Load Balancing (Since no DB)
// In production (serverless), this mimics state but resets on cold start.
// For true persistence, this would be Redis or SQL.
const MANAGER_LOAD_STATE = new Map<ManagerId, number>();

/**
 * Result of the Routing Process
 */
export type RoutingResult = {
    destinationEmail: string;
    targetName: string; // Manager Name or Store General
    locationId: string;
    managerId?: string;
    method: 'MANAGER_ASSIGNED' | 'STORE_FALLBACK' | 'DEFAULT_FALLBACK';
};

/**
 * Resolves the Store Location based on City Name and Brand Name (from UI)
 */
export function resolveLocation(cityName: string, storeName: string): StoreLocation | null {
    const city = CITIES.find(c => c.name === cityName);
    const brand = BRANDS.find(b => b.name === storeName);

    if (!city || !brand) return null;

    return STORE_LOCATIONS.find(loc => loc.cityId === city.id && loc.brandId === brand.id) || null;
}

/**
 * Selects the best available manager for a given location.
 * Logic:
 * 1. Filter for ACTIVE managers at this location.
 * 2. Sort by 'Last Assigned' time (Ascending = Oldest first).
 * 3. Pick the first one.
 * 4. Update the 'Last Assigned' time to now.
 */
export function routeToManager(location: StoreLocation): RoutingResult {
    const locationManagers = MANAGERS.filter(m =>
        m.locationId === location.id &&
        m.status === 'ACTIVE'
    );

    if (locationManagers.length === 0) {
        // Fallback to Store General Email
        return {
            destinationEmail: location.generalEmail,
            targetName: "Üldine Osakond", // "General Department"
            locationId: location.id,
            method: 'STORE_FALLBACK'
        };
    }

    // Load Balancing Logic
    // Sort by last assigned time (from memory state or 0)
    locationManagers.sort((a, b) => {
        const timeA = MANAGER_LOAD_STATE.get(a.id) || 0;
        const timeB = MANAGER_LOAD_STATE.get(b.id) || 0;
        return timeA - timeB;
    });

    const selectedManager = locationManagers[0];

    // "Update" state
    MANAGER_LOAD_STATE.set(selectedManager.id, Date.now());

    return {
        destinationEmail: selectedManager.email,
        targetName: selectedManager.name,
        locationId: location.id,
        managerId: selectedManager.id,
        method: 'MANAGER_ASSIGNED'
    };
}

/**
 * Main Entry Point for RFQ Routing
 */
export function routeRFQ(cityName: string, storeName: string): RoutingResult | null {
    console.log(`[Routing] Resolving: ${cityName} -> ${storeName}`);

    // 1. Find Location
    const location = resolveLocation(cityName, storeName);
    if (!location) {
        console.warn(`[Routing] Location not found for ${cityName} / ${storeName}`);
        return null;
    }

    // 2. Select Manager (with Load Balancing)
    const result = routeToManager(location);

    // [FUTURE INTEGRATION POINT]
    // Here we can fetch Partner-specific configuration to decide transmission method.
    // Example:
    // if (location.integrationType === 'DIRECTO_API') {
    //    return { method: 'API', endpoint: location.apiUrl, ... }
    // }

    console.log(`[Routing] Routed to: ${result.destinationEmail} via ${result.method}`);
    return result;
}
