"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import {
    ShieldCheck,
    Scale,
    Route,
    Truck,
    Ban,
    Split,
    CheckCircle2,
    ArrowRight,
    PackageCheck,
    AlertTriangle,
    Boxes,
    ServerCog,
    BadgeCheck
} from "lucide-react";

export default function DeliveryPartnersPage() {
    const { t } = useLanguage();
    const txt = (t as any).delivery_partners;

    if (!txt) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <section className="bg-[#0f172a] text-white pt-24 pb-32 relative overflow-hidden">
                {/* Tech Background Grid */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-slate-900"></div>

                <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wide mb-8">
                        <Route size={14} />
                        <span>Logistics Partner Program</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8 leading-tight">
                        {txt.title}
                    </h1>
                    <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                        {txt.subtitle}
                    </p>
                    <div className="flex justify-center">
                        <button className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
                            {txt.cta}
                            <ArrowRight size={20} />
                        </button>
                    </div>
                    <p className="mt-4 text-xs text-slate-500">{txt.cta_sub}</p>
                </div>
            </section>

            {/* Smart Delivery Gate Visualization */}
            <section className="py-24 -mt-20 relative z-20">
                <div className="container mx-auto px-4">
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12">
                        <div className="text-center mb-16">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center justify-center gap-2">
                                <ShieldCheck className="text-blue-600" />
                                {txt.gate.title}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                            {/* Connectors */}
                            <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-blue-100 via-blue-200 to-green-200 -z-10"></div>

                            {/* Step 1 */}
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-2xl bg-white border-2 border-slate-100 shadow-sm flex flex-col items-center justify-center mb-6 z-10">
                                    <Boxes size={32} className="text-slate-400 mb-2" />
                                    <div className="text-[10px] font-mono text-slate-400">INPUT</div>
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2">{txt.gate.step1}</h3>
                                <p className="text-sm text-slate-500">Items, Qty, Location</p>
                            </div>

                            {/* Step 2 */}
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-2xl bg-blue-50 border-2 border-blue-100 shadow-sm flex flex-col items-center justify-center mb-6 z-10 animate-pulse">
                                    <ServerCog size={32} className="text-blue-600 mb-2" />
                                    <div className="text-[10px] font-mono text-blue-600">PROCESSING</div>
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2">{txt.gate.step2}</h3>
                                <p className="text-sm text-slate-500">Weight, Volume, Lift</p>
                            </div>

                            {/* Step 3 */}
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-2xl bg-white border-2 border-slate-100 shadow-sm flex flex-col items-center justify-center mb-6 z-10 p-2">
                                    <div className="w-full text-left space-y-1">
                                        <div className="h-1.5 w-3/4 bg-green-400 rounded-full"></div>
                                        <div className="h-1.5 w-1/2 bg-slate-200 rounded-full"></div>
                                        <div className="h-1.5 w-full bg-slate-200 rounded-full"></div>
                                    </div>
                                    <div className="text-[9px] font-mono text-slate-400 mt-2">CLASSIFY</div>
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2">{txt.gate.step3}</h3>
                                <div className="flex flex-wrap justify-center gap-1">
                                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">{txt.gate.types.wolt}</span>
                                    <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">{txt.gate.types.split}</span>
                                </div>
                            </div>

                            {/* Step 4 */}
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-2xl bg-green-50 border-2 border-green-200 shadow-lg flex flex-col items-center justify-center mb-6 z-10">
                                    <BadgeCheck size={36} className="text-green-600 mb-1" />
                                    <div className="text-[10px] font-bold text-green-700">APPROVED</div>
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2">{txt.gate.step4}</h3>
                                <p className="text-sm font-semibold text-green-600">{txt.gate.caption}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Orders Fail (Reason Codes) */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-5xl">
                    <h2 className="text-3xl font-bold text-slate-900 text-center mb-16">{txt.reasons.title}</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ReasonCard code="OVER_WEIGHT_LIMIT" icon={Scale} text={txt.reasons.over_weight} />
                        <ReasonCard code="OVER_VOLUME_LIMIT" icon={Boxes} text={txt.reasons.over_volume} />
                        <ReasonCard code="STAIRS_NO_ELEVATOR" icon={AlertTriangle} text={txt.reasons.stairs} />
                        <ReasonCard code="FRAGILE_ITEMS" icon={Ban} text={txt.reasons.fragile} />
                        <ReasonCard code="NOT_SUPPORTED_CATEGORY" icon={Ban} text={txt.reasons.category} />
                    </div>
                </div>
            </section>

            {/* Partial Delivery Split */}
            <section className="py-20 bg-slate-50 border-y border-slate-200">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold mb-6">
                                <Split size={14} />
                                <span>Unique Logic</span>
                            </div>
                            <h2 className="text-4xl font-bold text-slate-900 mb-6">{txt.split.title}</h2>
                            <p className="text-lg text-slate-600 leading-relaxed mb-8">
                                {txt.split.desc}
                            </p>
                        </div>

                        {/* Visual Cart Split */}
                        <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200">
                            <div className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">Shopping Cart</div>

                            {/* Store Delivery Part */}
                            <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100 opacity-60">
                                <div className="flex items-center gap-3 mb-2">
                                    <Truck size={18} className="text-slate-500" />
                                    <span className="font-semibold text-slate-700">Store Delivery (3 days)</span>
                                </div>
                                <div className="pl-8 text-sm text-slate-600">
                                    {txt.split.example_store}
                                </div>
                            </div>

                            {/* Divider with Split Icon */}
                            <div className="relative flex items-center justify-center -my-2 z-10">
                                <div className="bg-white border border-slate-200 rounded-full p-2 text-slate-400">
                                    <Split size={16} />
                                </div>
                            </div>

                            {/* Express Delivery Part */}
                            <div className="bg-blue-50 rounded-xl p-4 mt-2 border border-blue-100 ring-2 ring-blue-500/10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center">
                                        <Route size={12} className="text-white" />
                                    </div>
                                    <span className="font-bold text-blue-900">Express Partner (30-60 min)</span>
                                </div>
                                <div className="pl-8 text-sm font-medium text-blue-800">
                                    {txt.split.example_express}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">{txt.benefits.title}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        {(txt.benefits.items as string[]).map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                                <CheckCircle2 className="text-blue-600 shrink-0" size={24} />
                                <span className="text-lg text-slate-700 font-medium">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pitch */}
            <section className="py-20 bg-slate-900 text-white">
                <div className="container mx-auto px-4 max-w-3xl text-center">
                    <h2 className="text-2xl font-bold mb-6 text-blue-400">{txt.pitch.title}</h2>
                    <p className="text-xl leading-relaxed text-slate-300">
                        "{txt.pitch.text}"
                    </p>

                    <div className="mt-12 p-6 bg-slate-800/50 rounded-2xl border border-slate-700 inline-block">
                        <button className="px-10 py-4 bg-white hover:bg-slate-200 text-slate-900 font-bold rounded-xl transition-colors text-lg flex items-center gap-3 mx-auto">
                            {txt.cta}
                            <ArrowRight size={20} />
                        </button>
                        <p className="mt-4 text-xs text-slate-500">{txt.cta_sub}</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

function ReasonCard({ code, icon: Icon, text }: { code: string, icon: any, text: string }) {
    return (
        <div className="p-6 rounded-xl border border-rose-100 bg-rose-50/30 flex items-start gap-4 hover:border-rose-200 transition-colors">
            <div className="shrink-0 p-2 bg-rose-100 rounded-lg text-rose-600">
                <Icon size={20} />
            </div>
            <div>
                <div className="text-[10px] font-mono text-rose-400 uppercase tracking-wide mb-1 opacity-70">
                    {code}
                </div>
                <div className="font-semibold text-slate-800">
                    {text}
                </div>
            </div>
        </div>
    );
}
