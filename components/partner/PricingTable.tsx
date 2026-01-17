"use client";

import { PARTNER_PLANS } from "@/app/lib/partners";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function PricingTable() {
    const { t } = useLanguage();

    // Map plans to array for easier rendering
    const plans = [
        {
            key: "free",
            config: PARTNER_PLANS.free,
            color: "slate",
            title: (t as any).partner_plans?.tiers?.free || "Baas",
        },
        {
            key: "partner",
            config: PARTNER_PLANS.partner,
            color: "emerald",
            popular: true,
            title: (t as any).partner_plans?.tiers?.pro || "Pro",
        },
        {
            key: "premium",
            config: PARTNER_PLANS.premium,
            color: "purple",
            title: (t as any).partner_plans?.tiers?.enterprise || "Enterprise",
        },
    ];

    return (
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
            {plans.map((plan) => (
                <div
                    key={plan.key}
                    className={`relative rounded-3xl p-8 border ${plan.popular ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 bg-white ring-1 ring-emerald-500' : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all'}`}
                >
                    {plan.popular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                            Populaarseim
                        </div>
                    )}

                    <div className="mb-6">
                        <h3 className={`text-lg font-bold text-${plan.color}-900 mb-2`}>{plan.title}</h3>
                        <div className="flex items-baseline gap-1">
                            {typeof plan.config.price === 'number' ? (
                                <>
                                    <span className="text-4xl font-black text-slate-900">€{plan.config.price}</span>
                                    <span className="text-slate-500 font-medium">{(t as any).partner_plans?.period?.monthly}</span>
                                </>
                            ) : (
                                <span className="text-3xl font-black text-slate-900">{(t as any).partner_plans?.period?.custom}</span>
                            )}
                        </div>
                    </div>

                    <ul className="space-y-4 mb-8">
                        {plan.config.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <svg className={`w-5 h-5 text-${plan.color}-500 flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm text-slate-600">{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <button
                        className={`w-full py-3 rounded-xl font-bold transition-transform active:scale-95 ${plan.popular
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20'
                                : `bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900`
                            }`}
                        onClick={() => window.location.href = "mailto:sales@smartbuild.ee"}
                    >
                        {(t as any).partner_plans?.contact_sales}
                    </button>
                </div>
            ))}
        </div>
    );
}
