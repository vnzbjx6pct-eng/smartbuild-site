"use client";

import Link from "next/link";
import { track } from "@/app/lib/analytics";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function HeroCTA() {
    const { t } = useLanguage();
    // Tracking logic
    const handleTrack = (action: "primary" | "secondary") => {
        const eventName = action === "primary" ? "hero_primary_cta_click" : "hero_secondary_cta_click";
        track(eventName, {
            device: window.innerWidth < 768 ? "mobile" : "desktop",
            source: "hero_optimization_v2"
        });
    };

    return (
        <div className="flex flex-col items-center animate-in fade-in duration-500 w-full max-w-2xl mx-auto mt-12">

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 w-full">

                {/* Primary CTA */}
                <Link
                    href="/products"
                    onClick={() => handleTrack("primary")}
                    className="group relative flex flex-col items-center justify-center w-full sm:w-auto min-w-[240px] px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all active:scale-[0.98] border border-emerald-500/50"
                >
                    <span className="text-base font-bold tracking-wide">{t.hero.btn_start}</span>
                    <span className="text-[10px] font-medium text-emerald-100/90 mt-0.5 opacity-90 group-hover:opacity-100">
                        {/* Static confidence text - could be added to dictionary if needed, but keeping simple for now */}
                        100% Tasuta
                    </span>
                </Link>

                {/* Secondary CTA */}
                <Link
                    href="/products" // or /rfq if distinct
                    onClick={() => handleTrack("secondary")}
                    className="group relative flex flex-col items-center justify-center w-full sm:w-auto min-w-[240px] px-8 py-3.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/60 text-slate-200 hover:text-white border border-slate-700/50 hover:border-slate-600 transition-all backdrop-blur-sm shadow-lg active:scale-[0.98]"
                >
                    <span className="text-base font-semibold">{t.hero.btn_rfq}</span>
                    <span className="text-[10px] font-medium text-slate-400 group-hover:text-slate-300 mt-0.5 transition-colors">
                        {t.trust.sla_response}
                    </span>
                </Link>
            </div>

            {/* Micro-Trust Reinforcement */}
            <p className="mt-6 text-xs text-slate-500/80 font-medium">
                {t.auth.privacy_note}
            </p>
        </div>
    );
}
