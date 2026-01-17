"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/app/lib/analytics";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function HeroSearch() {
    const { t } = useLanguage();
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [focused, setFocused] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        // Track and Navigate
        track("search_submit", { query: query });
        router.push(`/products?q=${encodeURIComponent(query)}`);
    };

    return (
        <div className="w-full max-w-2xl mx-auto relative group z-20">
            <div className={`absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 ${focused ? "opacity-50" : ""}`}></div>

            <form onSubmit={handleSearch} className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => { setFocused(true); track("search_focus"); if (window.innerWidth < 768) track("mobile_search_started"); }}
                    onBlur={() => setFocused(false)}
                    placeholder={t.common.search}
                    className="w-full h-14 md:h-auto py-4 pl-12 pr-4 bg-slate-900/90 text-white rounded-xl border border-slate-700/50 focus:border-emerald-500/50 outline-none shadow-2xl backdrop-blur-md transition-all placeholder:text-slate-500 text-lg md:text-base"
                />

                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </form>

            {/* Smart Hint (Micro-Copy) */}
            <div className={`absolute -bottom-8 left-0 right-0 flex justify-center transition-opacity duration-300 ${focused ? "opacity-100" : "opacity-0"}`}>
                {!query ? (
                    <span className="text-xs text-emerald-400 font-medium">✨ {t.hero.subtitle}</span>
                ) : (
                    <span className="text-xs text-blue-400 font-medium">↵ {t.common.search}</span>
                )}
            </div>
        </div>
    );
}
