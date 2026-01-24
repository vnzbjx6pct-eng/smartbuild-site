"use client";

import { useCart } from "@/app/components/cart/CartProvider";
import { useState } from "react";
import { track } from "@/app/lib/analytics";
import { useLanguage } from "@/components/i18n/LanguageProvider";

import type { Product } from "@/app/lib/types";

export default function AddToCartButton({ product, offerId }: { product: Product; offerId?: string | null }) {
    const { addToCart } = useCart();
    const { t } = useLanguage();
    const [added, setAdded] = useState(false);

    const handleAdd = () => {
        if (!offerId) {
            return;
        }
        addToCart(offerId, 1);
        track("add_to_cart_success", {
            product_id: product.id,
            product_name: product.name,
            category: product.category
        });
        if (window.innerWidth < 768) {
            track("mobile_add_to_cart");
        }
        setAdded(true);
        setTimeout(() => setAdded(false), 5000); // 5s timeout as requested
    };

    return (
        <div className="relative">
            <button
                onClick={handleAdd}
                className={`w-full px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${added
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
            >
                {added ? t.products.added_short : t.products.add_to_cart}
            </button>
            {added && (
                <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-[400px] bg-white text-slate-900 p-5 rounded-xl shadow-2xl border border-slate-100 animate-in slide-in-from-bottom-5 fade-in z-[100] flex flex-col gap-4">
                    <div className="flex items-start gap-4">
                        <div className="bg-emerald-100 p-2 rounded-full shrink-0">
                            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-base mb-1">{t.cart.added_success}</p>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {t.cart.empty_desc}
                            </p>
                        </div>
                        <button onClick={() => setAdded(false)} className="text-slate-400 hover:text-slate-600">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="flex flex-col gap-3 pl-[52px]">
                        <a
                            href="/cart"
                            onClick={() => track("toast_primary_click")}
                            className="bg-emerald-600 text-white text-center py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/10"
                        >
                            {t.cart.go_to_cart}
                        </a>
                        <button
                            onClick={() => {
                                track("toast_secondary_click");
                                setAdded(false);
                            }}
                            className="text-sm text-slate-500 hover:text-slate-700 font-medium text-left"
                        >
                            {t.cart.back_to_shop}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
