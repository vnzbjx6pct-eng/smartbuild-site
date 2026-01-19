"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@/app/lib/analytics";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const LOGOS = [
    { name: "Bauhof", src: "/logos/bauhof.png" }, // Using placeholders or text if image not real
    { name: "K-Rauta", src: "/logos/k-rauta.png" },
    { name: "Espak", src: "/logos/espak.png" },
    { name: "Ehitus ABC", src: "/logos/ehitusabc.png" },
    { name: "Decora", src: "/logos/decora.png" },
];

export default function TrustLogos() {
    const { t } = useLanguage();
    // Tracking visibility
    const ref = useRef<HTMLDivElement>(null);
    const [hasTracked, setHasTracked] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !hasTracked) {
                track("trust_block_viewed", { block: "homepage_logos" });
                setHasTracked(true);
            }
        });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [hasTracked]);

    return (
        <section ref={ref} className="w-full bg-slate-900 border-b border-slate-800 py-8">
            <div className="container mx-auto px-4 text-center">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-6">
                    {t.trust.compare_prices}
                </p>

                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale transition-all duration-500 hover:grayscale-0 hover:opacity-100">
                    {/* Text Fallback for Logos since we don't have actual SVG/Images handy in this env */}
                    {LOGOS.map((store) => (
                        <div key={store.name} className="flex items-center">
                            <span className="text-xl md:text-2xl font-black text-slate-300 pointer-events-none select-none font-sans tracking-tight">
                                {store.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
