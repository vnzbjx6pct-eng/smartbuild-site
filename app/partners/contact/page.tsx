"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
    Building2,
    Truck,
    Send,
    CheckCircle2,
    AlertCircle,
    ArrowLeft
} from "lucide-react";
import Link from 'next/link';

function PartnerContactContent() {
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const initialType = searchParams.get('type') || 'store';

    // @ts-ignore
    const strings = t.partners.form;

    // Form State
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [partnerType, setPartnerType] = useState(initialType);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        try {
            const res = await fetch('/api/contact/partners', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const json = await res.json();

            if (!res.ok) throw new Error(json.error || 'Failed to send');

            setSuccess(true);
        } catch (err) {
            console.error(err);
            setError("Error sending request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!strings) return null;

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">

                <Link href="/partners" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-8 transition-colors font-medium">
                    <ArrowLeft size={18} /> Tagasi
                </Link>

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-slate-100 mb-6">
                        {partnerType === 'delivery' ? (
                            <Truck size={32} className="text-blue-600" />
                        ) : (
                            <Building2 size={32} className="text-orange-600" />
                        )}
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">{strings.title}</h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto">{strings.subtitle}</p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                    {success ? (
                        <div className="p-16 text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                                <CheckCircle2 size={40} />
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900 mb-4">{strings.success}</h3>
                            <p className="text-lg text-slate-600 mb-8">{strings.success_desc}</p>
                            <Link href="/">
                                <button className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all">
                                    Tagasi avalehele
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">

                            {/* Company Details */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Ettevõtte andmed</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">{strings.company}</label>
                                        <input
                                            name="company_name"
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                            placeholder="Company OÜ"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">{strings.contact_name}</label>
                                        <input
                                            name="contact_name"
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                            placeholder="Jaan Tamm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">{strings.email}</label>
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                            placeholder="info@company.ee"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">{strings.phone}</label>
                                        <input
                                            name="phone"
                                            type="tel"
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                            placeholder="+372 5555 1234"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Partnership Details */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Koostöö tüüp</h3>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-3">{strings.type}</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            { id: 'store', label: strings.type_store, icon: Building2 },
                                            { id: 'delivery', label: strings.type_delivery, icon: Truck },
                                            { id: 'other', label: strings.type_other, icon: CheckCircle2 }
                                        ].map((type) => (
                                            <label
                                                key={type.id}
                                                className={`relative flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${partnerType === type.id ? 'border-orange-500 bg-orange-50' : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="partner_type"
                                                    value={type.id}
                                                    checked={partnerType === type.id}
                                                    onChange={(e) => setPartnerType(e.target.value)}
                                                    className="absolute opacity-0 w-full h-full cursor-pointer"
                                                />
                                                <div className={`mb-2 ${partnerType === type.id ? 'text-orange-600' : 'text-slate-400'}`}>
                                                    <type.icon size={24} />
                                                </div>
                                                <span className={`font-bold ${partnerType === type.id ? 'text-slate-900' : 'text-slate-600'}`}>{type.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-3">{strings.integration}</label>
                                    <select
                                        name="integration_type"
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white"
                                    >
                                        <option value="API">{strings.integration_api}</option>
                                        <option value="CSV">{strings.integration_csv}</option>
                                        <option value="Manual">{strings.integration_manual}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{strings.message}</label>
                                    <textarea
                                        name="message"
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
                                        placeholder=""
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-xl text-sm font-medium">
                                    <AlertCircle size={18} />
                                    {error}
                                </div>
                            )}

                            <div className="pt-4 border-t border-slate-100">
                                <button
                                    disabled={loading}
                                    className="w-full py-5 bg-orange-600 hover:bg-orange-700 text-white text-lg font-bold rounded-xl transition-all shadow-lg shadow-orange-600/20 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.99]"
                                >
                                    {loading ? (
                                        <span>Saving...</span>
                                    ) : (
                                        <>
                                            {strings.submit}
                                            <Send size={20} />
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-xs text-slate-400 mt-4">
                                    By submitting you agree to our privacy policy.
                                </p>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function PartnerContactPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <PartnerContactContent />
        </Suspense>
    );
}
