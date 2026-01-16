import type { Offer } from "../products";

export const KRAUTA_URLS: string[] = [
// сюда позже добавим ссылки K-Rauta
];

export async function fetchKRautaOffer(_url: string): Promise<{
id: string;
name: string;
category: string;
offer: Offer;
} | null> {
// Заглушка на будущее
return null;
}