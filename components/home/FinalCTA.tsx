"use client";

import Link from "next/link";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function FinalCTA() {
    const { t } = useLanguage();

    return (
        <section className="py-20 bg-slate-50 border-t border-slate-200">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold text-slate-900 mb-6">{t.hero.btn_start}?</h2>
                <p className="text-slate-600 mb-8 max-w-xl mx-auto">{t.hero.subtitle}</p>
                <Link href="/products" className="inline-block px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg">
                    {t.cart.open_catalog}
                </Link>
            </div>
        </section>
    );
}
