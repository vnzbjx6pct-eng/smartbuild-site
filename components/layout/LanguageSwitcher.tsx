"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="flex items-center gap-1 text-sm font-bold tracking-wide select-none">
            <button
                onClick={() => setLanguage("et")}
                className={`transition-colors ${language === "et" ? "text-white" : "text-slate-500 hover:text-slate-300"}`}
            >
                ET
            </button>
            <span className="text-slate-600">|</span>
            <button
                onClick={() => setLanguage("ru")}
                className={`transition-colors ${language === "ru" ? "text-white" : "text-slate-500 hover:text-slate-300"}`}
            >
                RU
            </button>
        </div>
    );
}
