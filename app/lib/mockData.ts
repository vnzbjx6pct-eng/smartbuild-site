import { Product } from "./types";
import { validateProduct, ValidationStatus } from "./productValidator";

export type StoreOffer = {
    storeName: string;
    price: number;
    currency: string;
    availability: "Laos" | "Piiratud kogus" | "Tellimisel";
    logoColor: string; // Mock visual distinction
};

const RAW_PRODUCTS: Product[] = [
    {
        id: "gyproc-normal",
        genericNameKey: "prod_gypsum_standard",
        brand: "Gyproc",
        specification: "GN 13 Standard 12.5mm",
        name: "Kipsplaat Gyproc GN 13 Standard 12.5mm", // fallback
        categoryKey: "cat_general",
        subcategoryKey: "sub_gypsum",
        category: "Üldehitus", // fallback
        unit: "tk",
        unitKey: "unit_pcs",
        image: "/images/products/gypsum-sheet.png",
        weightKg: 25,
        lengthCm: 250, widthCm: 120, heightCm: 1.25, // Too big for Wolt
        volumeM3: 0.039,
        bulky: true, // 1200x2500 is very large
        deliveryClass: "oversize",
        offers: [
            { storeName: "Ehituse ABC", price: 8.95, currency: "€", availability: "Laos", logoColor: "bg-red-500" },
            { storeName: "Espak", price: 8.50, currency: "€", availability: "Laos", logoColor: "bg-red-600" },
            { storeName: "Bauhof", price: 9.20, currency: "€", availability: "Laos", logoColor: "bg-orange-500" },
            { storeName: "K-Rauta", price: 8.90, currency: "€", availability: "Laos", logoColor: "bg-blue-600" },
            { storeName: "Decora", price: 8.85, currency: "€", availability: "Piiratud kogus", logoColor: "bg-green-600" },
            { storeName: "Karl Bilder", price: 9.50, currency: "€", availability: "Tellimisel", logoColor: "bg-black" },
        ]
    },
    {
        id: "osb-3",
        genericNameKey: "prod_osb3",
        specification: "12mm 2500x1250mm",
        name: "OSB-3 Plaat 12mm 2500x1250mm",
        categoryKey: "cat_timber",
        subcategoryKey: "sub_osb",
        category: "Puitmaterjal",
        unit: "tk",
        unitKey: "unit_pcs",
        image: "/images/products/osb-sheet.png",
        weightKg: 22,
        lengthCm: 250, widthCm: 125, heightCm: 1.2, // Too big for Wolt
        volumeM3: 0.037,
        bulky: true,
        deliveryClass: "oversize",
        offers: [
            { storeName: "Espak", price: 14.90, currency: "€", availability: "Laos", logoColor: "bg-red-600" },
            { storeName: "Bauhof", price: 15.50, currency: "€", availability: "Laos", logoColor: "bg-orange-500" },
            { storeName: "K-Rauta", price: 14.20, currency: "€", availability: "Laos", logoColor: "bg-blue-600" },
            { storeName: "Decora", price: 15.00, currency: "€", availability: "Laos", logoColor: "bg-green-600" },
            { storeName: "Karl Bilder", price: 14.80, currency: "€", availability: "Laos", logoColor: "bg-black" },
        ]
    },
    {
        id: "fibo-3",
        genericNameKey: "prod_fibo_block",
        specification: "3 200mm",
        name: "Fibo plokk 3 200mm",
        categoryKey: "cat_masonry",
        subcategoryKey: "sub_blocks",
        category: "Müür",
        unit: "tk",
        unitKey: "unit_pcs",
        image: "/images/products/fibo-block.png",
        weightKg: 6,
        lengthCm: 20, widthCm: 20, heightCm: 30, // Fits
        volumeM3: 0.005,
        bulky: false,
        deliveryClass: "medium",
        offers: [
            { storeName: "Espak", price: 2.85, currency: "€", availability: "Laos", logoColor: "bg-red-600" },
            { storeName: "Bauhof", price: 3.10, currency: "€", availability: "Piiratud kogus", logoColor: "bg-orange-500" },
            { storeName: "K-Rauta", price: 2.95, currency: "€", availability: "Laos", logoColor: "bg-blue-600" },
            { storeName: "Decora", price: 2.90, currency: "€", availability: "Laos", logoColor: "bg-green-600" },
            { storeName: "Karl Bilder", price: 3.20, currency: "€", availability: "Tellimisel", logoColor: "bg-black" },
        ]
    },
    {
        id: "wool-100",
        genericNameKey: "prod_stone_wool",
        brand: "Paroc",
        specification: "eXtra 100mm",
        name: "Kivivill Paroc eXtra 100mm",
        categoryKey: "cat_insulation",
        subcategoryKey: "sub_wool",
        category: "Soojustus",
        unit: "pakk",
        unitKey: "unit_pack",
        image: "/images/products/paroc-slabs.png",
        weightKg: 15,
        lengthCm: 120, widthCm: 60, heightCm: 40, // Too big (120 > 100)
        volumeM3: 0.3, // Large volume
        bulky: true,
        deliveryClass: "oversize",
        offers: [
            { storeName: "Espak", price: 24.50, currency: "€", availability: "Laos", logoColor: "bg-red-600" },
            { storeName: "Bauhof", price: 26.90, currency: "€", availability: "Laos", logoColor: "bg-orange-500" },
            { storeName: "K-Rauta", price: 23.90, currency: "€", availability: "Laos", logoColor: "bg-blue-600" },
            { storeName: "Decora", price: 25.50, currency: "€", availability: "Piiratud kogus", logoColor: "bg-green-600" },
            { storeName: "Karl Bilder", price: 24.90, currency: "€", availability: "Laos", logoColor: "bg-black" },
        ]
    },
    {
        id: "cement-standard",
        genericNameKey: "prod_cement",
        brand: "Kunda",
        specification: "Tsement CEM I 42,5N",
        name: "Tsement Kunda Standard 35kg",
        categoryKey: "cat_mixtures",
        subcategoryKey: "sub_cement",
        category: "Segud",
        unit: "kott",
        unitKey: "unit_bag",
        image: "/images/products/cement-bag.png",
        weightKg: 35,
        lengthCm: 50, widthCm: 30, heightCm: 15,
        volumeM3: 0.02,
        bulky: false,
        deliveryClass: "heavy",
        offers: [
            { storeName: "Ehituse ABC", price: 5.90, currency: "€", availability: "Laos", logoColor: "bg-red-500" },
            { storeName: "Espak", price: 6.20, currency: "€", availability: "Laos", logoColor: "bg-red-600" },
            { storeName: "Bauhof", price: 6.50, currency: "€", availability: "Laos", logoColor: "bg-orange-500" },
        ]
    },
    {
        id: "timber-2x4",
        genericNameKey: "prod_timber",
        specification: "C24 45x95mm 3m",
        name: "Höövelmaterjal C24 45x95mm 3000mm",
        categoryKey: "cat_timber",
        subcategoryKey: "sub_sawn",
        category: "Puitmaterjal",
        unit: "tk",
        unitKey: "unit_pcs",
        image: "/images/products/timber-plank.png",
        weightKg: 6,
        lengthCm: 300, widthCm: 9.5, heightCm: 4.5, // Too Long
        volumeM3: 0.012,
        bulky: true, // Long > 1.2m
        deliveryClass: "oversize",
        offers: [
            { storeName: "PuuMarket", price: 4.50, currency: "€", availability: "Laos", logoColor: "bg-green-700" },
            { storeName: "Espak", price: 4.80, currency: "€", availability: "Laos", logoColor: "bg-red-600" },
        ]
    },
    // NEW: Small Items for Wolt Eligibility
    {
        id: "screws-box",
        genericNameKey: "prod_generics.prod_screws", // Needs key added
        brand: "Essve",
        specification: "4.2x55mm 500tk",
        name: "Kruvid puidule 4.2x55mm 500tk",
        categoryKey: "cat_general",
        subcategoryKey: "sub_fasteners", // Needs key added
        category: "Kinnitused",
        unit: "karp",
        unitKey: "unit_pack",
        image: "/images/products/screws.png",
        weightKg: 1.5,
        lengthCm: 15, widthCm: 10, heightCm: 8, // Fits perfectly
        volumeM3: 0.002,
        bulky: false,
        deliveryClass: "small", // ELIGIBLE
        offers: [
            { storeName: "Espak", price: 12.50, currency: "€", availability: "Laos", logoColor: "bg-red-600" },
            { storeName: "Bauhof", price: 13.20, currency: "€", availability: "Laos", logoColor: "bg-orange-500" },
        ]
    },
    {
        id: "tape-measure",
        genericNameKey: "prod_generics.prod_tape",
        brand: "Stanley",
        specification: "5m",
        name: "Mõõdulint 5m",
        categoryKey: "cat_general",
        subcategoryKey: "sub_tools",
        category: "Tööriistad",
        unit: "tk",
        unitKey: "unit_pcs",
        image: "/images/products/tape.png",
        weightKg: 0.3,
        lengthCm: 8, widthCm: 8, heightCm: 4, // Fits perfectly
        volumeM3: 0.001,
        bulky: false,
        deliveryClass: "small", // ELIGIBLE
        offers: [
            { storeName: "Espak", price: 6.50, currency: "€", availability: "Laos", logoColor: "bg-red-600" },
            { storeName: "K-Rauta", price: 5.90, currency: "€", availability: "Laos", logoColor: "bg-blue-600" },
        ]
    },
    {
        id: "ceramic-tile-retro",
        genericNameKey: "prod_tiles_retro",
        specification: "20x20cm",
        name: "Keraamiline plaat Retro 20x20cm",
        categoryKey: "cat_finishing",
        subcategoryKey: "sub_tiles",
        category: "Viimistlus",
        unit: "pakk",
        unitKey: "unit_pack",
        image: "/images/products/tile-retro.png",
        weightKg: 8,
        // Dimensions MISSING to test "Unknown Dimensions" rule
        // lengthCm: 20, widthCm: 20, heightCm: 5,
        volumeM3: 0.015,
        bulky: false,
        fragile: true, // INELIGIBLE
        deliveryClass: "medium",
        offers: [
            { storeName: "Bauhof", price: 18.50, currency: "€", availability: "Laos", logoColor: "bg-orange-500" },
            { storeName: "Decora", price: 19.00, currency: "€", availability: "Laos", logoColor: "bg-green-600" },
        ]
    }
];

// Automatically apply Quality Gate
export const PRODUCTS = RAW_PRODUCTS.map(product => {
    const validation = validateProduct(product);
    return {
        ...product,
        status: validation.status,
        qualityScore: validation.qualityScore,
        rejectionReasons: validation.reasons
    };
});

