"use client";

import Link from "next/link";
import { track } from "@/app/lib/analytics";
import { useEffect } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function EmptyState() {
    const { t } = useLanguage();

    useEffect(() => {
        track("empty_state_shown");
    }, []);

    const handleCtaClick = () => {
        track("empty_state_cta_click");
    };

    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in duration-500">
            {/* Friendly Icon */}
            <div className="bg-slate-800/50 p-6 rounded-full border border-slate-700/50 mb-6 backdrop-blur-sm">
                <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{t.empty.no_results_title}</h3>
            <p className="text-slate-400 max-w-md mx-auto mb-10">
                {t.empty.no_results_desc}
            </p>

            {/* Primary Action */}
            <Link
                href="/rfq"
                onClick={handleCtaClick}
                className="group relative flex flex-col items-center justify-center w-full sm:w-auto min-w-[280px] px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all active:scale-[0.98] border border-emerald-500/50 mb-12"
            >
                <span className="text-base font-bold tracking-wide">{t.empty.action_rfq}</span>
                <span className="text-[10px] font-medium text-emerald-100/90 mt-0.5 opacity-90 group-hover:opacity-100">
                    {t.empty.sla_fast}
                </span>
            </Link>

            {/* Secondary Actions */}
            <div className="grid gap-4 w-full max-w-sm">
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 text-left">
                    <p className="text-sm font-semibold text-slate-300 mb-2">{t.empty.try_also}</p>
                    <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-lg bg-slate-700/50 text-xs text-slate-400 border border-slate-600/50">{t.empty.suggestion_general}</span>
                        <span className="px-3 py-1 rounded-lg bg-slate-700/50 text-xs text-slate-400 border border-slate-600/50">{t.empty.suggestion_no_brand}</span>
                    </div>
                </div>
                <p className="text-xs text-slate-500">{(t as any).empty?.hint_example ?? "Näiteks: kipsplaat → kips"}</p>
            </div>
        </div>
    );
}
