import type { Offer } from "../products";

export const BAUHOF_URLS: string[] = [
// сюда позже добавим ссылки Bauhof
];

export async function fetchBauhofOffer(_url: string): Promise<{
id: string;
name: string;
category: string;
offer: Offer;
} | null> {
// Заглушка на будущее
return null;
}