import type { Offer } from "../products";

//  Вставь/поправь реальные ссылки на товары Ehitus ABC.
// Если какая-то ссылка не парсится — просто замени её другой.
export const EABC_URLS: string[] = [
    // Примеры (замени на свои реальные ссылки при необходимости):
    "https://www.ehituseabc.ee/et/toode/portlandtsement-25-kg",
    "https://www.ehituseabc.ee/et/toode/kvartsliiv-25-kg",
    "https://www.ehituseabc.ee/et/toode/kipsplaat-1200x2000x12-5",
    "https://www.ehituseabc.ee/et/toode/osb-3-plaat-12mm-1250x2500",
    "https://www.ehituseabc.ee/et/toode/montaa-foom",
    "https://www.ehituseabc.ee/et/toode/seinavarv-valge-10l",
    "https://www.ehituseabc.ee/et/toode/puidukruvi-4x50",
    "https://www.ehituseabc.ee/et/toode/kipsikruvi-3-5x25",
    "https://www.ehituseabc.ee/et/toode/ehitusnurk-90",
    "https://www.ehituseabc.ee/et/toode/kivivill-100mm",
];

function slugFromUrl(url: string) {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1] || "item";
    return last.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function stripTags(s: string) {
    return s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

// Старательно ищем цену в HTML (форматы: 12.53 €, 12,53 €, 12.53€)
function parsePrice(html: string): number | null {
    const text = html
        .replace(/\u00a0/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ");

    // Часто цены встречаются рядом со знаком €
    const m =
        text.match(/(\d{1,5}(?:[.,]\d{2})?)\s*€/) ||
        text.match(/€\s*(\d{1,5}(?:[.,]\d{2})?)/);

    if (!m) return null;

    const raw = m[1].replace(",", ".");
    const num = Number(raw);
    return Number.isFinite(num) ? num : null;
}

function parseTitle(html: string): string | null {
    // 1) h1
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1?.[1]) return stripTags(h1[1]);

    // 2) title
    const t = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (t?.[1]) return stripTags(t[1]).replace(/\s*\|\s*.*$/, "").trim();

    return null;
}

export async function fetchEhitusABCOffer(url: string): Promise<{
    id: string;
    name: string;
    category: string;
    offer: Offer;
} | null> {
    try {
        const res = await fetch(url, {
            // Серверный fetch (Next.js) — можно добавить заголовки
            headers: {
                "user-agent":
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari",
                "accept-language": "et,en;q=0.9,ru;q=0.8",
            },
            // не кешируем в dev, чтобы видеть обновления
            cache: "no-store",
        });

        if (!res.ok) return null;

        const html = await res.text();

        const name = parseTitle(html);
        const price = parsePrice(html);

        if (!name || price === null) return null;

        return {
            id: `eabc-${slugFromUrl(url)}`,
            name,
            category: "Стройматериалы",
            offer: {
                store: "Ehituse ABC",
                price,
                url,
            },
        };
    } catch {
        return null;
    }
}