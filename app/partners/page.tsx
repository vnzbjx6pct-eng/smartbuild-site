"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import Link from "next/link";
import {
    CheckCircle2,
    ShoppingCart,
    Box,
    MapPin,
    Send,
    BarChart3,
    PieChart,
    TrendingUp,
    ArrowRight,
    Building2,
    Users
} from "lucide-react";

export default function PartnersPage() {
    const { t } = useLanguage();
    const txt = (t as any).partners;
    const common = (t as any).common;

    if (!txt) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <section className="bg-slate-900 text-white pt-24 pb-32 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-orange-500/10 rotate-12 transform translate-x-32 blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-1/3 h-full bg-blue-500/10 -rotate-12 transform -translate-x-32 blur-3xl pointer-events-none"></div>

                <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium mb-6">
                        <Building2 size={14} className="text-orange-500" />
                        <span>B2B Partner Program</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                        {txt.title}
                    </h1>
                    <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        {txt.subtitle}
                    </p>
                    <div className="flex flex-col items-center justify-center gap-4">
                        <Link
                            href="/partners/contact"
                            className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2 cursor-pointer relative z-20"
                        >
                            {txt.cta}
                            <ArrowRight size={20} />
                        </Link>

                        <a href="mailto:info@smartbuild.ee" className="text-sm text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-2 cursor-pointer z-20">
                            <Send size={12} /> info@smartbuild.ee
                        </a>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-20 -mt-20 relative z-20">
                <div className="container mx-auto px-4">
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl font-bold text-slate-900">{txt.how_it_works.title}</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                            {/* Connecting Line (Desktop) */}
                            <div className="hidden md:block absolute top-8 left-1/8 right-1/8 h-0.5 bg-slate-100 w-3/4 mx-auto -z-10"></div>

                            {[
                                { icon: ShoppingCart, text: txt.how_it_works.step1 },
                                { icon: Box, text: txt.how_it_works.step2 },
                                { icon: MapPin, text: txt.how_it_works.step3 },
                                { icon: Send, text: txt.how_it_works.step4 }
                            ].map((step, idx) => (
                                <div key={idx} className="flex flex-col items-center text-center group">
                                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-4 group-hover:border-orange-200 group-hover:shadow-orange-100 transition-all z-10">
                                        <step.icon className="text-slate-600 group-hover:text-orange-500 transition-colors" size={28} />
                                    </div>
                                    <span className="font-semibold text-slate-800">{step.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Value Props & Demo Split */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Left: Benefits */}
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-8">{txt.benefits.title}</h2>
                            <div className="space-y-4">
                                {(txt.benefits.list as string[]).map((benefit, idx) => (
                                    <div key={idx} className="flex items-start gap-4 p-4 rounded-xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-100">
                                        <div className="mt-1 shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                            <CheckCircle2 size={14} className="text-green-600" />
                                        </div>
                                        <span className="text-lg text-slate-700 font-medium">{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Demo Visuals */}
                        <div className="relative">
                            {/* Blur Back */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-orange-100 to-blue-50 rounded-full blur-3xl opacity-60"></div>

                            {/* RFQ Card Demo */}
                            <div className="relative bg-white rounded-2xl shadow-xl border border-slate-100 p-6 max-w-md mx-auto transform rotate-2 hover:rotate-0 transition-transform duration-500">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                            SB
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">SmartBuild RFQ #4829</div>
                                            <div className="text-sm font-bold text-slate-900">{txt.demo_rfq.title}</div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-md">Verified</span>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between py-2 border-b border-slate-50">
                                        <span className="text-sm text-slate-500">{txt.demo_rfq.city}</span>
                                        <span className="text-sm font-medium text-slate-900 flex items-center gap-1">
                                            <MapPin size={14} /> {txt.demo_rfq.example_city}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-slate-50">
                                        <span className="text-sm text-slate-500">{txt.demo_rfq.items}</span>
                                        <span className="text-sm font-medium text-slate-900">12 items</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-slate-50">
                                        <span className="text-sm text-slate-500">{txt.demo_rfq.client}</span>
                                        <span className="text-sm font-medium text-slate-900">{txt.demo_rfq.example_client}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button className="flex-1 bg-slate-900 text-white text-sm font-medium py-2 rounded-lg">Accept</button>
                                    <button className="flex-1 bg-slate-100 text-slate-600 text-sm font-medium py-2 rounded-lg">Ignore</button>
                                </div>
                            </div>

                            {/* Mini Analytics Badge */}
                            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-slate-100 max-w-[200px] transform hover:scale-105 transition-transform">
                                <div className="text-xs text-slate-400 mb-1">{txt.analytics.title}</div>
                                <div className="flex items-end gap-2 h-8">
                                    <div className="w-2 bg-blue-200 h-4 rounded-t"></div>
                                    <div className="w-2 bg-blue-300 h-6 rounded-t"></div>
                                    <div className="w-2 bg-blue-500 h-8 rounded-t"></div>
                                    <div className="w-2 bg-blue-300 h-5 rounded-t"></div>
                                </div>
                                <div className="text-xs font-bold text-slate-800 mt-2">+24% growth</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Smart Allocation */}
            <section className="py-20 bg-white border-y border-slate-100">
                <div className="container mx-auto px-4 text-center max-w-3xl">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-50 text-blue-600 mb-6">
                        <Users size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">{txt.allocation.title}</h2>
                    <p className="text-lg text-slate-500">
                        {txt.allocation.text}
                    </p>
                </div>
            </section>

            {/* Analytics Grid */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { title: txt.analytics.viz1, icon: PieChart, color: "text-purple-500", bg: "bg-purple-50" },
                            { title: txt.analytics.viz2, icon: BarChart3, color: "text-blue-500", bg: "bg-blue-50" },
                            { title: txt.analytics.viz3, icon: TrendingUp, color: "text-green-500", bg: "bg-green-50" }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                                    <item.icon className={item.color} size={24} />
                                </div>
                                <span className="font-semibold text-slate-700">{item.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 bg-slate-900 text-white text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-8">Ready to grow?</h2>
                    <Link href="/partners/contact" className="inline-flex items-center gap-3 px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20 text-lg cursor-pointer">
                        {txt.cta}
                        <ArrowRight size={20} />
                    </Link>
                    <p className="mt-6 text-slate-500 text-sm">
                        SmartBuild Platform &copy; 2026
                    </p>
                </div>
            </section>
        </div>
    );
}
