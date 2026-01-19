"use client";

import Link from "next/link";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { ArrowRight, Mail, Phone, MapPin } from "lucide-react";

export default function AboutPage() {
    const { t } = useLanguage();
    const about = (t as any).about || {};

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Hero */}
            <div className="bg-slate-900 text-white py-20 px-6 text-center bg-pattern-subtle">
                <div className="max-w-3xl mx-auto space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                        {about.title || "SmartBuildist"}
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl">
                        {about.subtitle || "Sõltumatu hinnavõrdlusportaal targale ehitajale."}
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-16 grid md:grid-cols-2 gap-12 max-w-5xl">
                <div className="space-y-6 text-lg text-slate-700 leading-relaxed">
                    <p>{about.desc_1}</p>
                    <p>{about.desc_2}</p>

                    <div className="pt-6">
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20"
                        >
                            {about.back_catalog || "Tagasi kataloogi"}
                            <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>

                {/* Contact Card */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-fit">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">{about.contact_title || "Kontakt"}</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 text-slate-600">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 shrink-0">
                                <Mail size={20} />
                            </div>
                            <span className="font-medium">{about.email}</span>
                        </div>
                        <div className="flex items-center gap-4 text-slate-600">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 shrink-0">
                                <Phone size={20} />
                            </div>
                            <span className="font-medium">{about.phone}</span>
                        </div>
                        <div className="flex items-center gap-4 text-slate-600">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 shrink-0">
                                <MapPin size={20} />
                            </div>
                            <span className="font-medium">{about.address}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
