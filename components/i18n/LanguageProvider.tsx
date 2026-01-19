"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Dictionary } from "@/app/lib/i18n/dictionary";
import { ET_DICTIONARY, RU_DICTIONARY } from "@/app/lib/i18n/dictionary";

type Language = "et" | "ru";

type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Dictionary;
};

const LanguageContext = createContext<LanguageContextType>({
    language: "et",
    setLanguage: () => { },
    t: ET_DICTIONARY,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("et");

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("sb_lang") as Language;
        if (saved === "et" || saved === "ru") {

            setTimeout(() => setLanguageState(saved), 0);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("sb_lang", lang);
    };

    // Safety mechanism: Proxy to fallback to ET if key missing in RU
    const createSafeDictionary = (target: any, fallback: any, path = "t"): any => {
        return new Proxy(target, {
            get(obj, prop: string) {
                const value = obj[prop];
                const fallbackValue = fallback?.[prop];

                if (value === undefined) {
                    if (process.env.NODE_ENV === "development" && fallbackValue !== undefined) {
                        console.warn(`[i18n] Missing translation for key: ${path}.${prop}`);
                    }
                    return fallbackValue; // Fallback to ET
                }

                if (typeof value === "object" && value !== null && !Array.isArray(value)) {
                    return createSafeDictionary(value, fallbackValue, `${path}.${prop}`);
                }

                return value;
            },
        });
    };

    const t = language === "ru"
        ? createSafeDictionary(RU_DICTIONARY, ET_DICTIONARY)
        : ET_DICTIONARY;

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);
