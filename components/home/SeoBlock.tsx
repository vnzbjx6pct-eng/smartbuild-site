"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function SeoBlock() {
    const { t } = useLanguage();

    return (
        <section className="py-8 bg-white">
            <div className="container mx-auto px-4 max-w-3xl text-center">
                <h2 className="sr-only">{t.how_it_works.title}</h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                    {(t as any).footer?.desc ?? "Sõltumatu ehitusmaterjalide hinnavõrdlusportaal Eestis."}
                    {" "}
                    {t.trust.compare_prices}.
                    {" "}
                    {t.hero.subtitle}
                </p>
            </div>
        </section>
    );
}
