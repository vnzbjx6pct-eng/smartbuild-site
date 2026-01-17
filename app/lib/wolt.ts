

export interface WoltConfig {
    merchantKey: string;
    env: "staging" | "production";
    merchantId: string;
    venueId: string;
    isDemo: boolean;
}

export interface WoltEstimateRequest {
    pickup: {
        location: { lat: number; lng: number };
        formatted_address: string;
    };
    dropoff: {
        location?: { lat: number; lng: number };
        street: string;
        city: string;
        post_code: string;
        flat_number?: string;
        comment?: string;
        phone: string;
    };
    items: {
        id?: string; // For server-side validation
        name: string;
        count: number;
    }[];
}

export interface WoltEstimateResponse {
    price: number; // EUR
    currency: string;
    eta_minutes: number;
    token?: string; // For binding the order
    is_demo: boolean;
}

export interface WoltOrderResponse {
    wolt_order_reference_id: string;
    tracking_url: string;
    status: string;
    is_demo: boolean;
}

const ENV_KEY = process.env.WOLT_DRIVE_MERCHANT_KEY;

export const WOLT_CONFIG: WoltConfig = {
    merchantKey: ENV_KEY || "",
    env: (process.env.WOLT_DRIVE_ENV as "staging" | "production") || "staging",
    merchantId: process.env.WOLT_DRIVE_MERCHANT_ID || "",
    venueId: process.env.WOLT_DRIVE_VENUE_ID || "",
    isDemo: !ENV_KEY, // Auto-enable demo if no key
};

export const WOLT_BASE_URL = WOLT_CONFIG.env === "production"
    ? "https://image-upload.wolt.com/api/v1"
    : "https://daas-public-api.wolt.com/v1";

// Using generic standard Pärnu location as warehouse
export const PARNU_WAREHOUSE = {
    lat: 58.385880,
    lng: 24.497110,
    address: "Suur-Jõe 52, 80042 Pärnu",
};

export const DELIVERY_LIMITS = {
    maxWeightKg: 20,          // Total Cart Limit (Strict 20kg)
    maxVolumeM3: 0.06,        // Total Cart Limit (60L = 0.06m3)
    itemMaxWeightKg: 20,      // Per Item Limit (implicitly constrained by total)
    itemMaxVolumeM3: 0.06,    // Per Item Limit
    maxSingleSideCm: 80,      // Max length for any side except longest? Or strict 80x80x100?
    // Prompt: max_single_side_cm=80, max_longest_side_cm=100
    maxLongestSideCm: 100,
    maxItems: 12,
    disallowBulky: true,
    disallowHazmat: true,
    disallowFragile: true,    // Strict rule
    requireKnownLogistics: true, // "unknown_dimensions_block=true"
    allowedCities: ["Pärnu", "Tallinn", "Tartu", "Narva"]
};

export enum ResolutionCode {
    ELIGIBLE = "ELIGIBLE",
    CITY_NOT_SUPPORTED = "CITY_NOT_SUPPORTED",
    ITEM_TOO_HEAVY = "ITEM_TOO_HEAVY", // Per item limit
    ITEM_TOO_LARGE = "ITEM_TOO_LARGE", // Per item limit
    CART_TOO_HEAVY = "CART_TOO_HEAVY", // Total limit
    CART_TOO_LARGE = "CART_TOO_LARGE", // Total limit
    OVER_ITEMS = "OVER_ITEMS", // Count limit
    BULKY_ITEMS = "BULKY_ITEMS",
    FRAGILE_ITEMS = "FRAGILE_ITEMS",
    HAZMAT_ITEMS = "HAZMAT_ITEMS",
    UNKNOWN_LOGISTICS = "UNKNOWN_LOGISTICS", // Generic unknown
    MISSING_DIMENSIONS = "MISSING_DIMENSIONS", // Specific missing dims
    MANUAL_BLOCK = "MANUAL_BLOCK", // deliveryAllowedWolt === false
}

export interface WoltEligibility {
    state: "eligible" | "partial" | "blocked";
    reason_code: string | null; // Top level reason
    reasons?: Array<{ code: string; message_key?: string }>;
    totals: {
        weight_kg: number;
        volume_cm3: number;
        longest_side_cm: number;
        max_side_cm: number;
    };
    limits: typeof DELIVERY_LIMITS;
    eligibleItems: Array<{ id?: string; sku?: string; qty: number }>; // Minimal item ref
    ineligibleItems: Array<{ id?: string; reasons: string[] }>;
}

export function checkDeliveryEligibility<T extends { weightKg?: number; volumeM3?: number; lengthCm?: number; widthCm?: number; heightCm?: number; deliveryAllowedWolt?: boolean; bulky?: boolean; hazmat?: boolean; sensitive?: boolean; fragile?: boolean; deliveryClass?: string; qty: number; name: string; id?: string }>(items: T[], city: string): WoltEligibility {

    // 1. Calculate Totals
    let totalWeight = 0;
    let totalVolume = 0;
    let maxLongest = 0;
    let maxSide = 0;

    items.forEach(item => {
        totalWeight += (item.weightKg || 0) * item.qty;
        totalVolume += (item.volumeM3 || 0) * item.qty;

        if (item.lengthCm && item.widthCm && item.heightCm) {
            const sides = [item.lengthCm, item.widthCm, item.heightCm].sort((a, b) => b - a);
            if (sides[0] > maxLongest) maxLongest = sides[0];
            if (sides[1] > maxSide) maxSide = sides[1];
        }
    });

    const totals = {
        weight_kg: totalWeight,
        volume_cm3: totalVolume * 1000000, // m3 to cm3 if needed, or keep m3? Prompt said volume_cm3. 0.06m3 = 60000cm3
        longest_side_cm: maxLongest,
        max_side_cm: maxSide
    };

    // 2. City Check
    if (!DELIVERY_LIMITS.allowedCities.includes(city)) {
        return {
            state: "blocked",
            reason_code: ResolutionCode.CITY_NOT_SUPPORTED,
            reasons: [{ code: ResolutionCode.CITY_NOT_SUPPORTED, message_key: "city_not_supported" }],
            totals,
            limits: DELIVERY_LIMITS,
            eligibleItems: [],
            ineligibleItems: items.map(i => ({ id: i.id, reasons: [ResolutionCode.CITY_NOT_SUPPORTED] }))
        };
    }

    // 3. Item Level Analysis (Split)
    const splitResult = splitCart(items);

    // 4. Cart Level Checks
    const cartReasons: string[] = [];

    // Check if TOTALS exceed limits (even if individual items are fine, the sum might be too heavy)
    if (totalWeight > DELIVERY_LIMITS.maxWeightKg) cartReasons.push(ResolutionCode.CART_TOO_HEAVY);
    if (totalVolume > DELIVERY_LIMITS.maxVolumeM3) cartReasons.push(ResolutionCode.CART_TOO_LARGE);
    if (items.reduce((acc, i) => acc + i.qty, 0) > DELIVERY_LIMITS.maxItems) cartReasons.push(ResolutionCode.OVER_ITEMS);

    // Determine State
    let state: "eligible" | "partial" | "blocked" = "eligible";

    // If cart limits exceeded -> Blocked (usually) or Partial if we assume splitting works for cart limits too?
    // User logic: "If state=partial... split cart automatically". 
    // Usually CART_TOO_HEAVY means the WHOLE order is too heavy. But maybe we can split?
    // For now, if cart global limits are exceeded, it's often BLOCKED unless we split into multiple Wolt orders (not supported yet).
    // Let's assume CART_TOO_HEAVY blocks the whole specific delivery unless items are split.

    // Logic:
    // If ANY ineligible items exist -> PARTIAL (unless all are ineligible -> BLOCKED/PARTIAL?)
    // If NO ineligible items, but CART limits exceeded -> BLOCKED (or split required)

    if (splitResult.ineligibleItems.length > 0) {
        state = splitResult.eligibleItems.length > 0 ? "partial" : "blocked";
    }

    // If perfectly clean split said OK, but total weight is huge?
    // Actually splitCart handles item limits. Global limits are separate.
    // If global cart weight > 20kg, even if all items are small, we can't send it in ONE wolt order.
    // We'll mark it as BLOCKED or PARTIAL? The prompt says "Split cart into Wolt package and Store package".
    // So if it's too heavy, maybe we just take as much as fits? 
    // Complex. Let's keep it simple: If Global Totals exceeded -> BLOCKED (User has to manually reduce).
    // OR we could technically support partial split for weight too, but that requires knapsack algo.
    // Current simple logic:
    if (cartReasons.length > 0) {
        state = "blocked";
    }

    // Override: If items were split out (e.g. oversize), but the REMAINDER is valid -> PARTIAL.
    // If we have cartReasons (e.g. Total Weight 50kg), we are blocked. 
    // BUT maybe the user inteded: "If I have 50kg of items, put 20kg to Wolt and 30kg to Pickup".
    // That is complex. Let's stick to: "Ineligible items are those PHYSICALLY incapable (too big/heavy)".
    // If the SUM of ELIGIBLE items is > 20kg, then we are BLOCKED (Total Limit).

    // Check eligible items total weight
    const eligibleWeight = splitResult.eligibleItems.reduce((s, i) => s + (i.weightKg || 0) * i.qty, 0);
    if (eligibleWeight > DELIVERY_LIMITS.maxWeightKg) {
        state = "blocked";
        cartReasons.push(ResolutionCode.CART_TOO_HEAVY);
    }

    const formattedEligible = splitResult.eligibleItems.map(i => ({ id: i.id, sku: i.id, qty: i.qty }));

    // Ineligible map
    const formattedIneligible = splitResult.ineligibleItems.map(i => ({
        id: i.item.id,
        reasons: i.reasons
    }));

    // If state is blocked because of cart limits, but we have valid items?
    // If we have ANY ineligible items, we are at least PARTIAL.
    // If ALL items are valid but Total Weight > 20kg -> BLOCKED (cannot split a bag of sand easily or multiple bags in one go logic missing).

    let mainReason = "ELIGIBLE";
    if (state !== "eligible") {
        if (cartReasons.length > 0) mainReason = cartReasons[0];
        else if (formattedIneligible.length > 0) mainReason = formattedIneligible[0].reasons[0]; // Grab first reason of first bad item
    }

    // If completely blocked (eligible is empty), state is blocked
    if (formattedEligible.length === 0) state = "blocked";

    return {
        state,
        reason_code: state === "eligible" ? null : mainReason,
        reasons: cartReasons.map(c => ({ code: c })),
        totals,
        limits: DELIVERY_LIMITS,
        eligibleItems: formattedEligible,
        ineligibleItems: formattedIneligible
    };
}

export interface SplitItem<T> {
    item: T;
    originalQty: number;
}

export interface IneligibleItem<T> {
    item: T;
    reasons: ResolutionCode[];
    originalQty: number;
}

// Output Types
export interface SplitResult<T> {
    eligibleItems: T[];
    ineligibleItems: IneligibleItem<T>[];
    eligibleTotals: {
        totalWeightKg: number;
        totalVolumeM3: number;
        totalItems: number;
    };
    ineligibleTotals: {
        totalWeightKg: number;
        totalVolumeM3: number;
        totalItems: number;
    };
}

interface ItemTotals {
    totalWeightKg: number;
    totalVolumeM3: number;
    totalItems: number;
}

export interface SplitResult<T = any> {
    eligibleItems: T[];
    ineligibleItems: IneligibleItem<T>[];
    eligibleTotals: ItemTotals;
    ineligibleTotals: ItemTotals;
    cartTotals: ItemTotals;
}

/**
 * Splits cart into eligible (Wolt) and ineligible (Pickup/RFQ) items.
 * Handles quantity splitting (e.g. 5 bags ok, 6th bag too heavy).
 */
export function splitCart<T extends { weightKg?: number; volumeM3?: number; lengthCm?: number; widthCm?: number; heightCm?: number; deliveryAllowedWolt?: boolean; bulky?: boolean; hazmat?: boolean; fragile?: boolean; deliveryClass?: string; qty: number; id?: string; name: string }>(items: T[]): SplitResult<T> {
    const eligibleItems: T[] = [];
    const ineligibleItems: IneligibleItem<T>[] = [];

    let currentWeight = 0;
    let currentVolume = 0;
    let currentCount = 0;

    const cartTotals = { totalWeightKg: 0, totalVolumeM3: 0, totalItems: 0 };

    for (const originalItem of items) {
        // Safe defaults
        const unitWeight = originalItem.weightKg || 1;
        const unitVolume = originalItem.volumeM3 || 0.01;

        // Update cart totals
        cartTotals.totalWeightKg += unitWeight * originalItem.qty;
        cartTotals.totalVolumeM3 += unitVolume * originalItem.qty;
        cartTotals.totalItems += originalItem.qty;

        // 1. Check PER-UNIT disqualifiers
        const reasons: ResolutionCode[] = [];

        // Manual Block
        if (originalItem.deliveryAllowedWolt === false) reasons.push(ResolutionCode.MANUAL_BLOCK);

        // Logical Constraints (Fragile, Hazmat, Class)
        if (DELIVERY_LIMITS.disallowBulky && (originalItem.bulky || originalItem.deliveryClass === "oversize" || originalItem.deliveryClass === "heavy")) reasons.push(ResolutionCode.BULKY_ITEMS);
        if (DELIVERY_LIMITS.disallowHazmat && originalItem.hazmat) reasons.push(ResolutionCode.HAZMAT_ITEMS);
        if (DELIVERY_LIMITS.disallowFragile && originalItem.fragile) reasons.push(ResolutionCode.FRAGILE_ITEMS);

        // Dimensions Check
        if (DELIVERY_LIMITS.requireKnownLogistics) {
            if (originalItem.lengthCm === undefined || originalItem.widthCm === undefined || originalItem.heightCm === undefined || originalItem.weightKg === undefined) {
                reasons.push(ResolutionCode.MISSING_DIMENSIONS);
            }
        }

        // If dimensions exist, check side limits
        if (originalItem.lengthCm && originalItem.widthCm && originalItem.heightCm) {
            const sides = [originalItem.lengthCm, originalItem.widthCm, originalItem.heightCm].sort((a, b) => b - a);
            const longest = sides[0];
            const others = sides.slice(1);

            if (longest > DELIVERY_LIMITS.maxLongestSideCm) reasons.push(ResolutionCode.ITEM_TOO_LARGE);
            if (others.some(s => s > DELIVERY_LIMITS.maxSingleSideCm)) reasons.push(ResolutionCode.ITEM_TOO_LARGE);
        }

        // Single Unit Limits
        if (unitWeight > DELIVERY_LIMITS.itemMaxWeightKg) reasons.push(ResolutionCode.ITEM_TOO_HEAVY);
        if (unitVolume > DELIVERY_LIMITS.itemMaxVolumeM3) reasons.push(ResolutionCode.ITEM_TOO_LARGE);

        if (!DELIVERY_LIMITS.requireKnownLogistics && (originalItem.weightKg === undefined || originalItem.volumeM3 === undefined)) {
            // Only if we DON'T require strict logs, we might still flag unknown generic
            reasons.push(ResolutionCode.UNKNOWN_LOGISTICS);
        }

        // If item is fundamentally ineligible, move WHOLE line to ineligible
        if (reasons.length > 0) {
            ineligibleItems.push({ item: originalItem, originalQty: originalItem.qty, reasons });
            continue;
        }

        // 2. Try to fit generic items (checking generic limits: Total Weight, Total Volume, Count)
        let fitQty = 0;
        let rejectQty = 0;

        for (let i = 0; i < originalItem.qty; i++) {
            const nextWeight = currentWeight + unitWeight;
            const nextVolume = currentVolume + unitVolume;
            const nextCount = currentCount + 1;

            if (nextWeight <= DELIVERY_LIMITS.maxWeightKg &&
                nextVolume <= DELIVERY_LIMITS.maxVolumeM3 &&
                nextCount <= DELIVERY_LIMITS.maxItems) {

                // Fits
                currentWeight = nextWeight;
                currentVolume = nextVolume;
                currentCount = nextCount;
                fitQty++;
            } else {
                // Reached limit
                rejectQty = originalItem.qty - fitQty;
                break;
            }
        }

        // 3. Distribute
        if (fitQty > 0) {
            if (fitQty === originalItem.qty) {
                eligibleItems.push(originalItem);
            } else {
                eligibleItems.push({ ...originalItem, qty: fitQty });
            }
        }

        if (rejectQty > 0) {
            const failReasons: ResolutionCode[] = [];

            // Check specific reasons for rejection
            if (currentWeight + unitWeight > DELIVERY_LIMITS.maxWeightKg) failReasons.push(ResolutionCode.CART_TOO_HEAVY);
            if (currentVolume + unitVolume > DELIVERY_LIMITS.maxVolumeM3) failReasons.push(ResolutionCode.CART_TOO_LARGE);
            if (currentCount + 1 > DELIVERY_LIMITS.maxItems) failReasons.push(ResolutionCode.OVER_ITEMS);

            // Fallback
            if (failReasons.length === 0) failReasons.push(ResolutionCode.CART_TOO_HEAVY);

            ineligibleItems.push({
                item: { ...originalItem, qty: rejectQty },
                originalQty: originalItem.qty,
                reasons: failReasons
            });
        }
    }

    // Helper to sum totals
    const calcTotals = (list: T[]) => ({
        totalWeightKg: Number(list.reduce((sum, i) => sum + (i.weightKg || 1) * i.qty, 0).toFixed(2)),
        totalVolumeM3: Number(list.reduce((sum, i) => sum + (i.volumeM3 || 0.01) * i.qty, 0).toFixed(3)),
        totalItems: list.reduce((sum, i) => sum + i.qty, 0)
    });

    const calcIneligibleTotals = (list: IneligibleItem<T>[]) => ({
        totalWeightKg: Number(list.reduce((sum, i) => sum + (i.item.weightKg || 1) * i.item.qty, 0).toFixed(2)),
        totalVolumeM3: Number(list.reduce((sum, i) => sum + (i.item.volumeM3 || 0.01) * i.item.qty, 0).toFixed(3)),
        totalItems: list.reduce((sum, i) => sum + i.item.qty, 0)
    });


    return {
        eligibleItems,
        ineligibleItems,
        eligibleTotals: calcTotals(eligibleItems),
        ineligibleTotals: calcIneligibleTotals(ineligibleItems),
        cartTotals: {
            totalWeightKg: Number(cartTotals.totalWeightKg.toFixed(2)),
            totalVolumeM3: Number(cartTotals.totalVolumeM3.toFixed(3)),
            totalItems: cartTotals.totalItems
        }
    };
}

export type SuggestionType = "REDUCE_QTY" | "MOVE_TO_NONWOLT" | "REMOVE_ITEM";

export interface SmartSuggestion {
    type: SuggestionType;
    itemId: string;
    itemName: string;
    fromQty?: number;
    toQty?: number;
    reason: ResolutionCode;
    originalTotals: ItemTotals;
    newTotals: ItemTotals;
}

/**
 * Generates a smart suggestion to make the cart eligible for Wolt delivery.
 * Tries to find the minimal change (reduce qty, move item) to satisfy limits.
 */
export function getSmartSuggestion<T extends { id?: string; name: string; weightKg?: number; volumeM3?: number; bulky?: boolean; hazmat?: boolean; qty: number }>(
    items: T[]
): SmartSuggestion | null {
    // 1. Calculate current state to see what's wrong
    const currentWeight = items.reduce((sum, i) => sum + (i.weightKg || 1) * i.qty, 0);
    const currentVolume = items.reduce((sum, i) => sum + (i.volumeM3 || 0.01) * i.qty, 0);
    const currentItems = items.reduce((sum, i) => sum + i.qty, 0);

    const totals = { totalWeightKg: currentWeight, totalVolumeM3: currentVolume, totalItems: currentItems };

    // Helper to calculate totals for a hypothetical cart
    const calcHypotheticalTotals = (list: T[]) => ({
        totalWeightKg: Number(list.reduce((sum, i) => sum + (i.weightKg || 1) * i.qty, 0).toFixed(2)),
        totalVolumeM3: Number(list.reduce((sum, i) => sum + (i.volumeM3 || 0.01) * i.qty, 0).toFixed(3)),
        totalItems: list.reduce((sum, i) => sum + i.qty, 0)
    });

    // Strategy 1: Bulky Items (Must move)
    if (DELIVERY_LIMITS.disallowBulky) {
        const bulkyItem = items.find(i => i.bulky);
        if (bulkyItem) {
            // Suggest moving the largest bulky item (or first found)
            const remainingItems = items.filter(i => i !== bulkyItem);
            return {
                type: "MOVE_TO_NONWOLT",
                itemId: bulkyItem.id || bulkyItem.name, // Fallback to name if id missing
                itemName: bulkyItem.name,
                reason: ResolutionCode.BULKY_ITEMS,
                originalTotals: totals,
                newTotals: calcHypotheticalTotals(remainingItems)
            };
        }
    }

    // Strategy 2: Hazmat Items (Must move)
    if (DELIVERY_LIMITS.disallowHazmat) {
        const hazmatItem = items.find(i => i.hazmat);
        if (hazmatItem) {
            const remainingItems = items.filter(i => i !== hazmatItem);
            return {
                type: "MOVE_TO_NONWOLT",
                itemId: hazmatItem.id || hazmatItem.name,
                itemName: hazmatItem.name,
                reason: ResolutionCode.HAZMAT_ITEMS,
                originalTotals: totals,
                newTotals: calcHypotheticalTotals(remainingItems)
            };
        }
    }

    // Strategy 3: Over Weight
    if (currentWeight > DELIVERY_LIMITS.maxWeightKg) {
        // Find item with highest total weight contribution
        const heaviestItem = [...items].sort((a, b) => ((b.weightKg || 1) * b.qty) - ((a.weightKg || 1) * a.qty))[0];

        if (heaviestItem) {
            const unitWeight = heaviestItem.weightKg || 1;
            const overweightAmount = currentWeight - DELIVERY_LIMITS.maxWeightKg;
            const minRemoveQty = Math.ceil(overweightAmount / unitWeight);

            if (minRemoveQty < heaviestItem.qty) {
                // We can reduce quantity
                const newQty = heaviestItem.qty - minRemoveQty;
                const modifiedItem = { ...heaviestItem, qty: newQty };
                const otherItems = items.filter(i => i !== heaviestItem);
                const newCart = [...otherItems, modifiedItem];

                return {
                    type: "REDUCE_QTY",
                    itemId: heaviestItem.id || heaviestItem.name,
                    itemName: heaviestItem.name,
                    fromQty: heaviestItem.qty,
                    toQty: newQty,
                    reason: ResolutionCode.CART_TOO_HEAVY,
                    originalTotals: totals,
                    newTotals: calcHypotheticalTotals(newCart)
                };
            } else {
                // Must remove entire item to fix weight (or it's single item)
                const remainingItems = items.filter(i => i !== heaviestItem);
                return {
                    type: "REMOVE_ITEM",
                    itemId: heaviestItem.id || heaviestItem.name,
                    itemName: heaviestItem.name,
                    reason: ResolutionCode.CART_TOO_HEAVY,
                    originalTotals: totals,
                    newTotals: calcHypotheticalTotals(remainingItems)
                };
            }
        }
    }

    // Strategy 4: Over Volume
    if (currentVolume > DELIVERY_LIMITS.maxVolumeM3) {
        // Find item with highest total volume
        const largestItem = [...items].sort((a, b) => ((b.volumeM3 || 0.01) * b.qty) - ((a.volumeM3 || 0.01) * a.qty))[0];

        if (largestItem) {
            const unitVol = largestItem.volumeM3 || 0.01;
            const overVol = currentVolume - DELIVERY_LIMITS.maxVolumeM3;
            const minRemoveQty = Math.ceil(overVol / unitVol);

            if (minRemoveQty < largestItem.qty) {
                const newQty = largestItem.qty - minRemoveQty;
                const modifiedItem = { ...largestItem, qty: newQty };
                const newCart = [...items.filter(i => i !== largestItem), modifiedItem];

                return {
                    type: "REDUCE_QTY",
                    itemId: largestItem.id || largestItem.name,
                    itemName: largestItem.name,
                    fromQty: largestItem.qty,
                    toQty: newQty,
                    reason: ResolutionCode.CART_TOO_LARGE,
                    originalTotals: totals,
                    newTotals: calcHypotheticalTotals(newCart)
                };
            } else {
                const remainingItems = items.filter(i => i !== largestItem);
                return {
                    type: "REMOVE_ITEM",
                    itemId: largestItem.id || largestItem.name,
                    itemName: largestItem.name,
                    reason: ResolutionCode.CART_TOO_LARGE,
                    originalTotals: totals,
                    newTotals: calcHypotheticalTotals(remainingItems)
                };
            }
        }
    }

    // Strategy 5: Over Items (Count)
    if (currentItems > DELIVERY_LIMITS.maxItems) {
        // Reduced logic as per prompt
        const sorted = [...items].sort((a, b) => {
            const scoreA = (a.weightKg || 0) + (a.volumeM3 || 0) * 1000;
            const scoreB = (b.weightKg || 0) + (b.volumeM3 || 0) * 1000;
            return scoreA - scoreB;
        });

        const targetItem = sorted[0];
        const overCount = currentItems - DELIVERY_LIMITS.maxItems;
        // Try to reduce its qty
        if (targetItem.qty > overCount) {
            const newQty = targetItem.qty - overCount;
            const modifiedItem = { ...targetItem, qty: newQty };
            const newCart = [...items.filter(i => i !== targetItem), modifiedItem];
            return {
                type: "REDUCE_QTY",
                itemId: targetItem.id || targetItem.name,
                itemName: targetItem.name,
                fromQty: targetItem.qty,
                toQty: newQty,
                reason: ResolutionCode.OVER_ITEMS,
                originalTotals: totals,
                newTotals: calcHypotheticalTotals(newCart)
            };
        } else {
            // Remove whole item
            const remainingItems = items.filter(i => i !== targetItem);
            return {
                type: "REMOVE_ITEM",
                itemId: targetItem.id || targetItem.name,
                itemName: targetItem.name,
                reason: ResolutionCode.OVER_ITEMS,
                originalTotals: totals,
                newTotals: calcHypotheticalTotals(remainingItems)
            };
        }
    }

    return null;
}

export const CITIES = ["Tallinn", "Tartu", "Narva", "Pärnu", "Kohtla-Järve", "Viljandi", "Rakvere", "Haapsalu", "Kuressaare"];
