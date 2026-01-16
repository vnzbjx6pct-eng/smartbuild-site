// app/cart/page.tsx
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCart } from "@/components/cart/CartProvider";

function eur(n: number) {
    return `${n.toFixed(2)} €`;
}

export default function CartPage() {
    const { items, inc, dec, remove, clear, totalItems } = useCart();

    // Индикативная сумма: берём самую дешевую цену в offers * qty
    const indicativeTotal = useMemo(() => {
        let sum = 0;
        for (const it of items) {
            const best =
                it.offers?.reduce<number | null>((min, o) => (min === null || o.price < min ? o.price : min), null) ??
                null;
            if (best !== null) sum += best * it.qty;
        }
        return sum;
    }, [items]);

    return (
        <main className="mx-auto max-w-6xl px-4 py-10">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <div className="text-sm text-slate-500">SmartBuild</div>
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Ostukorv</h1>
                    <p className="mt-2 text-slate-600">
                        Lisa kogused, vali poed ja koosta hinnapäring suurele mahule.
                    </p>
                </div>

                <div className="flex gap-2">
                    <Link
                        href="/products"
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 hover:bg-slate-50"
                    >
                        ← Tagasi kataloogi
                    </Link>
                    <Link
                        href="/rfq"
                        className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
                    >
                        Koosta hinnapäring
                    </Link>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <div className="text-lg font-semibold text-slate-900">Ostukorv on tühi</div>
                    <p className="mt-2 text-slate-600">
                        Lisa tooteid kataloogist, et võrrelda hindu ja küsida pakkumist.
                    </p>
                    <Link
                        href="/products"
                        className="mt-5 inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
                    >
                        Ava kataloog
                    </Link>
                </div>
            ) : (
                <>
                    <div className="mt-8 grid gap-4">
                        {items.map((it) => {
                            const best =
                                it.offers?.reduce<{ store: string; price: number } | null>((min, o) => {
                                    if (!min || o.price < min.price) return { store: o.store, price: o.price };
                                    return min;
                                }, null) ?? null;

                            return (
                                <div key={it.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <div className="text-xs text-slate-500">{it.category ?? "Kategooria"}</div>
                                            <div className="mt-1 text-xl font-semibold text-slate-900">{it.name}</div>
                                            <div className="mt-2 text-sm text-slate-600">
                                                Ühik: <span className="font-medium text-slate-900">{it.unit ?? "tk"}</span>
                                            </div>

                                            {best ? (
                                                <div className="mt-2 text-sm">
                                                    <span className="text-slate-600">Odavaim (indikatiivne): </span>
                                                    <span className="font-semibold text-emerald-700">{eur(best.price)}</span>
                                                    <span className="text-slate-600"> — </span>
                                                    <span className="font-medium text-slate-900">{best.store}</span>
                                                </div>
                                            ) : (
                                                <div className="mt-2 text-sm text-slate-500">
                                                    Sellel tootel pole hetkel hindasid.
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => dec(it.id)}
                                                className="h-10 w-10 rounded-2xl border border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                                                aria-label="Vähenda"
                                            >
                                                −
                                            </button>
                                            <div className="min-w-[72px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-center">
                                                <div className="text-xs text-slate-500">Kogus</div>
                                                <div className="text-sm font-semibold text-slate-900">{it.qty}</div>
                                            </div>
                                            <button
                                                onClick={() => inc(it.id)}
                                                className="h-10 w-10 rounded-2xl border border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                                                aria-label="Suurenda"
                                            >
                                                +
                                            </button>

                                            <button
                                                onClick={() => remove(it.id)}
                                                className="ml-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 hover:bg-slate-50"
                                            >
                                                Eemalda
                                            </button>
                                        </div>
                                    </div>

                                    {/* Bulk hint */}
                                    {it.qty >= 10 ? (
                                        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                                            Suure koguse puhul võib hind olla madalam. Soovitame küsida hinnapakkumist.
                                        </div>
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>

                    {/* Summary */}
                    <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="text-sm text-slate-600">
                                    Tooteid (kogus kokku): <span className="font-semibold text-slate-900">{totalItems}</span>
                                </div>
                                <div className="mt-1 text-sm text-slate-600">
                                    Indikatiivne kogusumma:{" "}
                                    <span className="font-semibold text-slate-900">{eur(indicativeTotal)}</span>
                                </div>
                                <div className="mt-2 text-xs text-slate-500">
                                    * Indikatiivne hind põhineb hetke odavaimal pakkumisel. Täpse hinna saad hinnapäringu kaudu.
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={clear}
                                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 hover:bg-slate-50"
                                >
                                    Tühjenda ostukorv
                                </button>
                                <Link
                                    href="/rfq"
                                    className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-700"
                                >
                                    Koosta hinnapäring
                                </Link>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </main>
    );
}