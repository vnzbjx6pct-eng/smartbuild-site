"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useState } from "react";
import {
    Mail,
    MessageSquare,
    Send,
    CheckCircle2,
    AlertCircle,
    HelpCircle,
    ChevronDown,
    ChevronUp
} from "lucide-react";

export default function ContactPage() {
    const { t } = useLanguage();
    const strings = t.contact;

    // Form State
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // FAQ State
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        try {
            const res = await fetch('/api/contact/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const json = await res.json();

            if (!res.ok) throw new Error(json.error || 'Failed to send');

            setSuccess(true);
        } catch (err) {
            console.error(err);
            setError(strings.form.error);
        } finally {
            setLoading(false);
        }
    };

    if (!strings) return null;

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-6xl">

                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">{strings.title}</h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto">{strings.subtitle}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                    {/* Left: Contact Form */}
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                <Mail size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">Saada sõnum</h2>
                        </div>

                        {success ? (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center py-16">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-green-800 mb-2">{strings.form.success}</h3>
                                <p className="text-green-700">{strings.form.success_desc}</p>
                                <button
                                    onClick={() => setSuccess(false)}
                                    className="mt-6 text-sm font-semibold text-green-700 underline hover:text-green-800"
                                >
                                    Saada uus sõnum
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">{strings.form.name}</label>
                                        <input
                                            name="name"
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="Jaan Tamm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">{strings.form.email}</label>
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="jaan@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{strings.form.topic}</label>
                                    <select
                                        name="topic"
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                    >
                                        <option value="General">{strings.form.topics.general}</option>
                                        <option value="Orders">{strings.form.topics.orders}</option>
                                        <option value="Partners">{strings.form.topics.partners}</option>
                                        <option value="Technical">{strings.form.topics.technical}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{strings.form.message}</label>
                                    <textarea
                                        name="message"
                                        required
                                        rows={5}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                                        placeholder="..."
                                    />
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                                        <AlertCircle size={16} />
                                        {error}
                                    </div>
                                )}

                                <button
                                    disabled={loading}
                                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <span>Thinking...</span>
                                    ) : (
                                        <>
                                            {strings.form.submit}
                                            <Send size={18} />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Right: FAQ */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                                <HelpCircle size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">{strings.faq.title}</h2>
                            <p className="text-slate-500 mb-6 text-sm">{(strings.faq as any).intro}</p>
                        </div>

                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div
                                    key={i}
                                    className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${openFaq === i ? 'border-orange-200 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
                                >
                                    <button
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        className="w-full flex items-center justify-between p-5 text-left font-semibold text-slate-800"
                                    >
                                        {(strings.faq as any)[`q${i}`]}
                                        <span className={`text-slate-400 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}>
                                            <ChevronDown size={20} />
                                        </span>
                                    </button>

                                    <div
                                        className={`px-5 text-slate-600 overflow-hidden transition-all duration-300 ease-in-out ${openFaq === i ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
                                    >
                                        {(strings.faq as any)[`a${i}`]}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Customer Support CTA */}
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center mt-10">
                            <h3 className="font-bold text-slate-900 text-lg mb-2">{(strings.faq as any).no_answer}</h3>
                            <button
                                onClick={() => {
                                    document.querySelector('input[name="topic"]')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/20"
                            >
                                {(strings.faq as any).contact_us} <MessageSquare size={18} />
                            </button>
                        </div>

                        <div className="bg-slate-900 rounded-2xl p-8 text-white mt-6">
                            <h3 className="font-bold text-xl mb-2">Oled ettevõte?</h3>
                            <p className="text-slate-300 mb-6">Pakume erilahendusi ehituspoodidele ja transpordifirmadele.</p>
                            <a
                                href="/partners"
                                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-bold transition-colors text-sm"
                            >
                                Vaata partnerprogrammi <ArrowRightIcon size={16} />
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

function ArrowRightIcon({ size }: { size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
    )
}