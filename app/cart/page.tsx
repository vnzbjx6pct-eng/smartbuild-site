"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { getTranslatedProduct } from "@/app/lib/i18n/productUtils";
import WoltDeliveryWidget from "@/components/cart/WoltDeliveryWidget";

function eur(n: number) {
    return `${n.toFixed(2)} €`;
}

export default function CartPage() {
    const { items, inc, dec, remove, clear, totalItems } = useCart();
    const { t } = useLanguage();

    const [deliveryMethod, setDeliveryMethod] = useState("pickup");

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
        <main className="bg-pattern-subtle min-h-screen mx-auto max-w-6xl px-4 py-10">
            <div className="flex items-end justify-between gap-4">
                <div>
                    {/* Stepper */}
                    <div className="flex items-center gap-3 text-sm font-medium mb-6 text-slate-400">
                        <span className="text-white font-bold bg-slate-800 border border-slate-700 px-3 py-1 rounded-lg shadow-sm ring-1 ring-white/5">{t.rfq.step_1}</span>
                        <span className="text-slate-600">→</span>
                        <span className="text-slate-500">{t.rfq.step_2}</span>
                        <span className="text-slate-600">→</span>
                        <span className="text-slate-500">{t.rfq.step_3}</span>
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">{t.cart.title}</h1>
                    <p className="mt-2 text-slate-300 font-medium">
                        {t.cart.subtitle}
                    </p>
                </div>

                <div className="flex gap-2">
                    <Link
                        href="/products"
                        className="rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all hover:border-slate-600"
                    >
                        ← {t.cart.back_to_shop}
                    </Link>
                    <div className="flex flex-col items-end gap-1">
                        {deliveryMethod === 'pickup' && (
                            <>
                                <Link
                                    href="/rfq"
                                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 shadow-sm shadow-emerald-500/20 cursor-pointer"
                                >
                                    {t.cart.request_quote}
                                </Link>
                                <span className="text-[10px] text-slate-400 font-medium">
                                    {t.cart.response_time}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="mt-8 rounded-3xl bg-surface p-8 text-center">
                    <div className="text-3xl mb-4">🛒</div>
                    <div className="text-lg font-bold text-slate-200">{t.cart.empty_title}</div>
                    <p className="mt-2 text-slate-400">
                        {t.cart.empty_text}
                    </p>
                    <Link
                        href="/products"
                        className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
                    >
                        {t.cart.open_catalog}
                    </Link>
                </div>
            ) : (
                <>
                    <div className="mt-8 grid gap-4">
                        {items.map((it) => {
                            const best =
                                it.offers?.reduce<{ store: string; price: number } | null>((min, o) => {
                                    if (!min || o.price < min.price) return { store: o.storeName, price: o.price };
                                    return min;
                                }, null) ?? null;

                            const { displayName, categoryName, unitName } = getTranslatedProduct(it, t);

                            return (
                                <div key={it.id} className="rounded-3xl bg-surface p-6">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">{categoryName ?? t.common.category}</div>
                                            <div className="text-xl font-bold text-slate-100">{displayName}</div>
                                            <div className="mt-2 text-sm text-slate-400">
                                                {t.common.unit}: <span className="font-medium text-slate-200">{unitName ?? t.common.pcs}</span>
                                            </div>

                                            {best ? (
                                                <div className="mt-3 text-sm flex items-center gap-2">
                                                    <span className="text-slate-400">{t.cart.cheapest_indicative} </span>
                                                    <span className="font-bold text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded text-base">{eur(best.price)}</span>
                                                    <span className="text-slate-600"> — </span>
                                                    <span className="font-medium text-slate-300">{best.store}</span>
                                                </div>
                                            ) : (
                                                <div className="mt-2 text-sm text-slate-500">
                                                    {t.cart.no_prices}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center bg-slate-900 rounded-xl border border-slate-700 p-1">
                                                <button
                                                    onClick={() => dec(it.id)}
                                                    className="h-10 w-10 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white flex items-center justify-center text-lg transition-colors"
                                                    aria-label={t.common.decrease}
                                                >
                                                    −
                                                </button>
                                                <div className="min-w-[48px] text-center">
                                                    <div className="text-sm font-bold text-slate-100 leading-none">{it.qty}</div>
                                                </div>
                                                <button
                                                    onClick={() => inc(it.id)}
                                                    className="h-10 w-10 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white flex items-center justify-center text-lg transition-colors"
                                                    aria-label={t.common.increase}
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => remove(it.id)}
                                                className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-red-400 hover:bg-red-900/20 hover:border-red-900/30 flex items-center justify-center transition-colors"
                                                aria-label={t.common.remove}
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Bulk hint */}
                                    {
                                        it.qty >= 10 ? (
                                            <div className="mt-4 rounded-2xl border border-emerald-900/30 bg-emerald-900/10 px-4 py-3 text-sm text-emerald-400">
                                                {t.cart.bulk_discount_hint}
                                            </div>
                                        ) : null
                                    }
                                </div>
                            );
                        })}
                    </div>

                    <WoltDeliveryWidget items={items} onDeliveryChange={setDeliveryMethod} />

                    {/* Summary */}
                    <div className="mt-8 rounded-3xl bg-surface p-6">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="text-sm text-slate-400">
                                    {t.cart.total_items} <span className="font-semibold text-slate-100">{totalItems}</span>
                                </div>
                                <div className="mt-1 text-sm text-slate-400">
                                    {t.cart.total_indicative}{" "}
                                    <span className="font-semibold text-slate-100">{eur(indicativeTotal)}</span>
                                </div>
                                <div className="mt-2 text-xs text-slate-500">
                                    {t.cart.indicative_disclaimer}
                                </div>

                                {/* Trust Signals */}
                                <div className="mt-4 flex flex-wrap gap-3">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-900/20 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                        </svg>
                                        {t.cart.trust_direct}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-900/20 text-blue-400 text-xs font-medium border border-blue-500/20">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                            <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2h-1V6a4 4 0 00-4-4zm-1 5a1 1 0 112 0v1H9V7zm1 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                        </svg>
                                        {t.cart.trust_secure}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 w-full sm:w-auto items-center sm:items-end">
                                {deliveryMethod === 'pickup' && (
                                    <Link
                                        href="/rfq"
                                        className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-8 py-4 text-base font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02]"
                                    >
                                        {t.cart.request_quote} →
                                    </Link>
                                )}
                                {deliveryMethod === 'wolt' && (
                                    <div className="text-sm text-slate-500 italic text-center">
                                        {(t as any).wolt?.confirm_delivery} ↑
                                    </div>
                                )}
                                <div className="flex gap-4 items-center">
                                    <div className="text-[10px] text-center text-emerald-400 font-bold bg-emerald-900/20 py-1 px-2 rounded-lg border border-emerald-500/20">
                                        {t.cart.save_money_hint}
                                    </div>
                                    <button
                                        onClick={clear}
                                        className="text-xs text-slate-500 hover:text-slate-300 underline decoration-slate-700 transition-colors"
                                    >
                                        {t.cart.clear_cart}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </main>
    );
}