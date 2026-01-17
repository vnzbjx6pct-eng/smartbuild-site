"use client";

import { useRef, useEffect, useState } from "react";
import { track } from "@/app/lib/analytics";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function HowItWorks() {
    const { t } = useLanguage();
    // Tracking
    const ref = useRef<HTMLDivElement>(null);
    const [hasTracked, setHasTracked] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !hasTracked) {
                track("trust_block_viewed", { block: "how_it_works" });
                setHasTracked(true);
            }
        }, { threshold: 0.5 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [hasTracked]);

    return (
        <section ref={ref} className="py-16 md:py-24 bg-white border-b border-slate-100">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">{t.how_it_works.title}</h2>
                    <p className="text-slate-600">{t.how_it_works.subtitle}</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-slate-100 -z-10"></div>

                    {/* Step 1 */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center flex flex-col items-center hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl mb-6 shadow-lg shadow-slate-900/20">
                            1
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{t.how_it_works.step_1_title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            {t.how_it_works.step_1_desc}
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center flex flex-col items-center hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl mb-6 shadow-lg shadow-emerald-600/20">
                            2
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{t.how_it_works.step_2_title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            {t.how_it_works.step_2_desc}
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center flex flex-col items-center hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl mb-6 shadow-lg shadow-blue-600/20">
                            3
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{t.how_it_works.step_3_title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            {t.how_it_works.step_3_desc}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
