"use client";

import PricingTable from "@/components/partner/PricingTable";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function PartnerPlansPage() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-slate-900 py-20 px-4 text-center">
                <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
                    {(t as any).partner_plans?.title || "Paketid ehituspoodidele"}
                </h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                    {(t as any).partner_plans?.subtitle || "Kasvata müüki läbi SmartBuild'i kvalifitseeritud päringute."}
                </p>
            </div>

            {/* Plans */}
            <div className="py-20 bg-slate-50">
                <PricingTable />
            </div>

            {/* Trust / Content */}
            <div className="py-20 max-w-4xl mx-auto px-4 text-center">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <div className="text-4xl mb-4">📈</div>
                        <div className="font-bold text-slate-900 mb-2">{(t as any).partner_plans?.features?.leads || "Kvaliteetsed päringud"}</div>
                        <p className="text-sm text-slate-500">Ainult ostuvalmis kliendid. Kontrollitud andmed.</p>
                    </div>
                    <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <div className="text-4xl mb-4">🔍</div>
                        <div className="font-bold text-slate-900 mb-2">{(t as any).partner_plans?.features?.analytics || "Analüütika"}</div>
                        <p className="text-sm text-slate-500">Näe täpselt, milliseid tooteid sinu piirkonnas otsitakse.</p>
                    </div>
                    <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <div className="text-4xl mb-4">🚀</div>
                        <div className="font-bold text-slate-900 mb-2">{(t as any).partner_plans?.features?.exclusive || "Ainuõigus"}</div>
                        <p className="text-sm text-slate-500">Ole eelistatud partner oma kodulinnas.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
