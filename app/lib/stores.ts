// app/lib/stores.ts
export const STORES = ["Ehituse ABC", "Bauhof", "K-Rauta", "Espak", "Decora", "Karl Bilder"] as const;

export type StoreName = (typeof STORES)[number];

export const STORE_HOME_URL: Record<StoreName, string> = {
    "Ehituse ABC": "https://ehituseabc.ee/",
    Bauhof: "https://www.bauhof.ee/",
    "K-Rauta": "https://www.k-rauta.ee/",
    Espak: "https://espak.ee/",
    Decora: "https://www.decora.ee/",
    "Karl Bilder": "https://www.karlbilder.ee/",
};