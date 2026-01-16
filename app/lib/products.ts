import type { StoreName } from "./stores";

export type Offer = {
    store: StoreName;
    price: number;
    url: string;
};

export type Product = {
    id: string;
    name: string;
    category: string;
    offers: Offer[];
};

export const PRODUCTS: Product[] = [
    {
        id: "cement-25",
        name: "Цемент 25 кг (CEM II)",
        category: "Сухие смеси",
        offers: [
            { store: "Ehituse ABC", price: 5.59, url: "https://www.ehituseabc.ee" },
            { store: "Bauhof", price: 6.99, url: "https://www.bauhof.ee" },
            { store: "K-Rauta", price: 7.49, url: "https://www.k-rauta.ee" },
        ],
    },
    {
        id: "osb-12",
        name: "OSB плита 12 мм (1250x2500)",
        category: "Листы / Плиты",
        offers: [
            { store: "Ehituse ABC", price: 17.99, url: "https://www.ehituseabc.ee" },
            { store: "Bauhof", price: 19.50, url: "https://www.bauhof.ee" },
            { store: "K-Rauta", price: 21.20, url: "https://www.k-rauta.ee" },
        ],
    },
];