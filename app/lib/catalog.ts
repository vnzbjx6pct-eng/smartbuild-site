// app/lib/catalog.ts

import type { Product, Offer } from "./products";
import { STORES, type StoreName } from "./stores";

import { fetchEhitusABCOffer, EABC_URLS } from "./providers/ehituseabc";
import { fetchBauhofOffer, BAUHOF_URLS } from "./providers/bauhof";
import { fetchKRautaOffer, KRAUTA_URLS } from "./providers/krauta";

/**
* Вспомогательная структура результата от провайдера
*/
type ProviderResult = {
    id: string;
    name: string;
    category: string;
    offer: Offer & { store: StoreName | string };
} | null;

/**
* Нормализация текста (для склейки одинаковых товаров)
*/
function normalizeKey(s: string) {
    return s
        .toLowerCase()
        .replace(/\u00a0/g, " ")
        .replace(/[()]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

/**
* Главная функция сборки каталога
* Ее вызывает API /api/products
*/
export async function buildCatalog(): Promise<Product[]> {
    const tasks: Promise<ProviderResult>[] = [];

    // Ehituse ABC
    for (const url of EABC_URLS) {
        tasks.push(fetchEhitusABCOffer(url));
    }

    // Bauhof
    for (const url of BAUHOF_URLS) {
        tasks.push(fetchBauhofOffer(url));
    }

    // K-Rauta
    for (const url of KRAUTA_URLS) {
        tasks.push(fetchKRautaOffer(url));
    }

    const results = await Promise.allSettled(tasks);

    const map = new Map<string, Product>();

    for (const r of results) {
        if (r.status !== "fulfilled" || !r.value) continue;

        const { id, name, category, offer } = r.value;

        const key = normalizeKey(name + "|" + category);

        if (!map.has(key)) {
            map.set(key, {
                id,
                name,
                category,
                offers: [],
            });
        }

        map.get(key)!.offers.push({
            store: offer.store as StoreName,
            price: offer.price,
            url: offer.url,
        });
    }

    return Array.from(map.values());
}