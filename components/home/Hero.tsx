"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import HeroSearch from "./HeroSearch";
import HeroCTA from "./HeroCTA";

export default function Hero() {
    const { t } = useLanguage();

    return (
        <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-pattern-hero">
            <div className="container mx-auto px-4 text-center max-w-4xl relative z-10">
                {/* Visual Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/50 bg-slate-800/40 backdrop-blur-md px-4 py-1.5 text-sm font-medium text-slate-300 mb-8 shadow-xl ring-1 ring-white/10">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    {(t as any).footer?.desc ?? "Sõltumatu ehitusmaterjalide hindamine"}
                </div>

                <h1 className="text-3xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.2] md:leading-[1.1] drop-shadow-lg px-2">
                    {t.hero.title_1} <br className="block md:hidden" /> {t.hero.title_2} <br className="hidden md:block" />
                </h1>

                <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-sm font-light">
                    {t.hero.subtitle}
                </p>

                {/* Search Input */}
                <HeroSearch />

                {/* Trust Blocks */}
                <div className="flex flex-wrap justify-center gap-4 text-slate-300 text-sm font-medium">
                    <div className="flex items-center gap-2 bg-slate-800/40 px-5 py-2.5 rounded-xl border border-slate-700/50 backdrop-blur-sm shadow-lg hover:bg-slate-800/60 transition-colors">
                        <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <span>{t.trust.compare_prices}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-800/40 px-5 py-2.5 rounded-xl border border-slate-700/50 backdrop-blur-sm shadow-lg hover:bg-slate-800/60 transition-colors">
                        <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <span>{t.empty.sla_fast}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-800/40 px-5 py-2.5 rounded-xl border border-slate-700/50 backdrop-blur-sm shadow-lg hover:bg-slate-800/60 transition-colors">
                        <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <span>{t.rfq.hero_subtitle}</span>
                    </div>
                </div>

                <HeroCTA />
            </div>
        </section>
    );
}
