import { STORES, type StoreName } from "./stores";

export const SUPPORTED_CITIES = ["Pärnu", "Tallinn", "Tartu"] as const;
export type CityName = (typeof SUPPORTED_CITIES)[number];

export const SUPPORTED_STORES = STORES;

export { StoreName };

export type StoreContact = {
    defaultEmail: string;
    cities?: {
        [city: string]: string;
    };
};

// City -> Store -> Email
export const CONTACTS_BY_CITY: Record<CityName, Record<StoreName, string>> = {
    "Pärnu": {
        "Ehituse ABC": "parnu@ehituseabc.ee",
        "Bauhof": "parnu@bauhof.ee",
        "K-Rauta": "parnu.kauplus@kesko.ee",
        "Espak": "parnu@espak.ee",
        "Decora": "parnu@decora.ee",
        "Karl Bilder": "parnu@karlbilder.ee",
    },
    "Tallinn": {
        "Ehituse ABC": "tallinn@ehituseabc.ee", // Placeholder
        "Bauhof": "tallinn@bauhof.ee",
        "K-Rauta": "tallinn@kesko.ee",
        "Espak": "tallinn@espak.ee",
        "Decora": "tallinn@decora.ee",
        "Karl Bilder": "tallinn@karlbilder.ee",
    },
    "Tartu": {
        "Ehituse ABC": "tartu@ehituseabc.ee", // Placeholder
        "Bauhof": "tartu@bauhof.ee",
        "K-Rauta": "tartu@kesko.ee",
        "Espak": "tartu@espak.ee",
        "Decora": "tartu@decora.ee",
        "Karl Bilder": "tartu@karlbilder.ee",
    }
};

// Fallback for stores if city missing (optional, but good for safety)
export const DEFAULT_CONTACTS: Record<StoreName, string> = {
    "Ehituse ABC": "info@ehituseabc.ee",
    "Bauhof": "info@bauhof.ee",
    "K-Rauta": "klienditugi@kesko.ee",
    "Espak": "info@espak.ee",
    "Decora": "info@decora.ee",
    "Karl Bilder": "info@karlbilder.ee",
};
