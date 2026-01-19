"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/components/cart/CartProvider";
import Link from "next/link";
import type { StoreName, CityName } from "@/app/lib/storeContacts";
import { SUPPORTED_STORES, SUPPORTED_CITIES } from "@/app/lib/storeContacts";
import { track } from "@/app/lib/analytics";
import { useUser } from "@/components/auth/UserProvider";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { getTranslatedProduct } from "@/app/lib/i18n/productUtils";

const CITIES = SUPPORTED_CITIES;

export default function RFQWizardPage() {
    const { items, clear } = useCart();
    const { user, login } = useUser();
    const { t } = useLanguage();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Logging Helper
    const logFunnel = (action: string, details?: string) => {
        console.log(`[RFQ_FUNNEL] ${action}${details ? `: ${details}` : ''}`);
        // In real app: send to analytics
    };

    // Initialize Log
    useState(() => {
        if (items.length > 0) {
            logFunnel("RFQ_STARTED", `Items: ${items.length}`);
            track("start_rfq", { items_count: items.length });
            if (window.innerWidth < 768) track("mobile_rfq_started");
        }
    });

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        city: "Pärnu" as CityName,
        company: "",
        customerType: "private", // Default to private
        notes: "",
        consent: false,
    });

    // Auto-fill from user session
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                email: user.email || prev.email,
                name: user.name || prev.name,
                city: (user.city as CityName) || prev.city,
            }));
        }
    }, [user]);

    const [selectedStores, setSelectedStores] = useState<StoreName[]>([]);

    // Handlers
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const toggleStore = (store: StoreName) => {
        if (selectedStores.includes(store)) {
            setSelectedStores(selectedStores.filter((s) => s !== store));
        } else {
            setSelectedStores([...selectedStores, store]);
        }
    };

    // Validation
    const validateStep2 = () => {
        if (selectedStores.length === 0) return false;
        return true;
    };

    const validateStep3 = () => {
        if (!formData.email || !formData.email.includes("@")) return false;
        if (!formData.city) return false;
        if (!formData.consent) return false;
        return true;
    };

    // Navigation
    const nextStep = () => {
        if (step === 1) {
            logFunnel("RFQ_STEP_2", "Products Reviewed");
            setStep(2);
        } else if (step === 2) {
            if (validateStep2()) {
                logFunnel("RFQ_STEP_3", `Stores Selected: ${selectedStores.length}`);
                setStep(3);
            } else {
                alert(t.validation.select_store);
            }
        }
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    // Submit
    const handleSubmit = async () => {
        if (!validateStep3()) {
            alert(t.validation.fill_required);
            return;
        }

        setLoading(true);
        logFunnel("RFQ_SUBMITTED");
        track("submit_rfq", {
            city: formData.city,
            customer_type: formData.customerType,
            stores_count: selectedStores.length,
            items_count: items.length
        });

        try {
            const res = await fetch("/api/rfq/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    selectedStores,
                    cartItems: items,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || t.validation.error_sending);

            // Persist user session for future convenience
            await login({
                email: formData.email,
                name: formData.name,
                city: formData.city
            });

            setSuccess(true);
            logFunnel("RFQ_SUCCESS");
            track("rfq_success");
            if (window.innerWidth < 768) track("mobile_rfq_completed");
            clear();
            window.scrollTo(0, 0);
        } catch (err: any) {
            logFunnel("RFQ_ERROR", err.message);
            alert("Viga: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Rendering Success Screen
    if (success) {
        return (
            <div className="mx-auto max-w-xl px-4 py-20 text-center animate-in zoom-in-95 duration-300">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-900/40 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
                    <svg className="h-10 w-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">{t.rfq.success_title}</h1>
                <p className="text-xl text-slate-400 mb-6">
                    {t.rfq.success_desc_prefix} <strong>{formData.email}</strong>.
                </p>

                <div className="bg-slate-900 rounded-2xl p-6 mb-8 text-left border border-slate-700">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="block text-slate-500 mb-1">{t.rfq.selected_stores}</span>
                            <span className="font-semibold text-white">{selectedStores.length} {t.products.shops}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 mb-1">{t.rfq.item_count}</span>
                            <span className="font-semibold text-white">{items.length} {t.common.pcs}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/" className="px-8 py-3 rounded-xl bg-slate-800 text-slate-200 font-bold hover:bg-slate-700 hover:text-white transition-colors border border-slate-700">
                        {t.common.back_home}
                    </Link>
                    <Link href="/products" className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20">
                        {t.products.add_to_cart}
                    </Link>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-16 text-center">
                <h1 className="text-3xl font-bold text-white mb-4">{t.cart.empty_title}</h1>
                <p className="text-slate-400 mb-8">{t.cart.empty_text}</p>
                <Link href="/products" className="rounded-xl bg-orange-500 px-6 py-3 text-white font-bold hover:bg-orange-400 transition-colors shadow-lg shadow-orange-900/20">
                    {t.cart.open_catalog}
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            {/* NEW HEADLINE */}
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">{t.rfq.hero_title}</h1>
            <p className="text-lg text-slate-400 mb-10 flex items-center gap-2">
                <span className="bg-emerald-900/30 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-sm font-bold">{t.rfq.hero_badge}</span>
                {t.rfq.hero_subtitle}
            </p>

            {/* Progress Bar */}
            <div className="flex items-center gap-4 mb-10 text-sm font-medium border-b border-slate-800 pb-4 overflow-x-auto">
                <div className={`whitespace-nowrap px-3 py-1 rounded-lg ${step >= 1 ? 'bg-slate-800 text-white font-bold border border-slate-700 shadow-sm ring-1 ring-white/5' : 'text-slate-500'}`}>{t.rfq.step_1}</div>
                <div className="text-slate-600">→</div>
                <div className={`whitespace-nowrap px-3 py-1 rounded-lg ${step >= 2 ? 'bg-slate-800 text-white font-bold border border-slate-700 shadow-sm ring-1 ring-white/5' : 'text-slate-500'}`}>{t.rfq.step_2}</div>
                <div className="text-slate-600">→</div>
                <div className={`whitespace-nowrap px-3 py-1 rounded-lg ${step >= 3 ? 'bg-slate-800 text-white font-bold border border-slate-700 shadow-sm ring-1 ring-white/5' : 'text-slate-500'}`}>{t.rfq.step_3}</div>
            </div>

            <div className="grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-12 bg-surface rounded-3xl p-8">

                    {/* STEP 1: PRODUCTS REVIEW */}
                    {step === 1 && (
                        <div className="animate-in slide-in-from-left-4 fade-in duration-300">
                            <h2 className="text-2xl font-bold text-white mb-6">{t.rfq.review_products}</h2>
                            {/* Mobile: Card View */}
                            <div className="block sm:hidden space-y-4 mb-4">
                                {items.map((item) => {
                                    const { displayName, unitName } = getTranslatedProduct(item, t);
                                    return (
                                        <div key={item.id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                                            <div className="font-bold text-slate-200 mb-1">{displayName}</div>
                                            <div className="flex justify-between items-center text-sm text-slate-400">
                                                <span>{t.common.quantity}:</span>
                                                <span className="font-semibold text-slate-200">{item.qty} {unitName ?? t.common.pcs}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Desktop: Table View */}
                            <div className="hidden sm:block bg-slate-900/30 rounded-2xl overflow-hidden border border-slate-700 mb-8">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-700">
                                        <tr>
                                            <th className="p-4">{t.common.product}</th>
                                            <th className="p-4 text-right">{t.common.quantity}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/50">
                                        {items.map((item) => {
                                            const { displayName, unitName } = getTranslatedProduct(item, t);
                                            return (
                                                <tr key={item.id}>
                                                    <td className="p-4 font-medium text-slate-200">{displayName}</td>
                                                    <td className="p-4 text-right text-slate-400">
                                                        {item.qty} {unitName ?? t.common.pcs}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end">
                                <button onClick={nextStep} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 transition-all active:scale-95 flex items-center gap-2">
                                    {t.rfq.next_select_stores} →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: STORES */}
                    {step === 2 && (
                        <div className="animate-in slide-in-from-right-4 fade-in duration-300">
                            <h2 className="text-2xl font-bold text-white mb-2">{t.rfq.select_stores_title}</h2>
                            <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-xl mb-6 flex gap-3 text-sm text-blue-300">
                                <span className="font-bold text-xl">💡</span>
                                <p>{t.rfq.tip_pick_3}</p>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4 mb-8">
                                {SUPPORTED_STORES.map((store) => (
                                    <label key={store} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selectedStores.includes(store) ? 'border-emerald-500 bg-emerald-900/20 ring-1 ring-emerald-500' : 'border-slate-700 bg-slate-900/30 hover:bg-slate-800 hover:border-slate-600'}`}>
                                        <input
                                            type="checkbox"
                                            checked={selectedStores.includes(store)}
                                            onChange={() => toggleStore(store)}
                                            className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500/50 border-slate-600 bg-slate-800"
                                        />
                                        <span className={`font-bold ${selectedStores.includes(store) ? 'text-emerald-400' : 'text-slate-200'}`}>{store}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="flex justify-between mt-8 pt-6 border-t border-slate-700/50">
                                <button onClick={prevStep} className="text-slate-400 font-medium hover:text-white px-4 transition-colors">{t.common.back}</button>
                                <button onClick={nextStep} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 transition-all active:scale-95">
                                    {t.rfq.next_contact} →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: CONTACT FORM & SUBMIT */}
                    {step === 3 && (
                        <div className="animate-in slide-in-from-right-4 fade-in duration-300">
                            <h2 className="text-2xl font-bold text-white mb-6">{t.rfq.contact_title}</h2>

                            <div className="grid gap-6 sm:grid-cols-2 mb-8">
                                {/* Segmentation */}
                                <div className="col-span-2 bg-amber-900/10 rounded-xl p-5 border border-amber-500/20">
                                    <label className="block text-sm font-bold text-amber-400 mb-3">{t.rfq.role_label}</label>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="customerType" value="private" checked={formData.customerType === "private"} onChange={handleChange} className="w-4 h-4 text-orange-500 focus:ring-orange-500 bg-slate-900 border-slate-600" />
                                            <span className="text-sm text-slate-300">{t.rfq.role_private}</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="customerType" value="builder" checked={formData.customerType === "builder"} onChange={handleChange} className="w-4 h-4 text-orange-500 focus:ring-orange-500 bg-slate-900 border-slate-600" />
                                            <span className="text-sm text-slate-300">{t.rfq.role_builder}</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="customerType" value="company" checked={formData.customerType === "company"} onChange={handleChange} className="w-4 h-4 text-orange-500 focus:ring-orange-500 bg-slate-900 border-slate-600" />
                                            <span className="text-sm text-slate-300">{t.rfq.role_company}</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-slate-300 mb-1">{t.rfq.email_label} <span className="text-red-400">*</span></label>
                                    <input autoFocus required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full rounded-xl border border-slate-600 bg-slate-900 text-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500 transition-colors" placeholder="sinu@email.ee" />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-slate-300 mb-1">{t.rfq.city_label} <span className="text-red-400">*</span></label>
                                    <select name="city" value={formData.city} onChange={handleChange} className="w-full rounded-xl border border-slate-600 bg-slate-900 text-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                                        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>

                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-slate-300 mb-1">{t.rfq.name_label}</label>
                                    <input name="name" value={formData.name} onChange={handleChange} type="text" className="w-full rounded-xl border border-slate-600 bg-slate-900 text-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500" />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-slate-300 mb-1">{t.rfq.phone_label}</label>
                                    <input name="phone" value={formData.phone} onChange={handleChange} type="tel" className="w-full rounded-xl border border-slate-600 bg-slate-900 text-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500" />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-300 mb-1">{t.rfq.notes_label}</label>
                                    <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className="w-full rounded-xl border border-slate-600 bg-slate-900 text-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500" placeholder="Nt. soovin transporti objektile..." />
                                </div>
                            </div>

                            {/* Trust / What happens next */}
                            <div className="bg-emerald-900/20 rounded-xl p-6 mb-8 border border-emerald-500/20">
                                <h3 className="text-sm font-bold text-emerald-400 mb-4 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    {t.rfq.what_next_title}
                                </h3>
                                <div className="space-y-3">
                                    <p className="text-sm text-slate-400 ml-6">
                                        1. {t.rfq.what_next_1.replace("{count}", selectedStores.length.toString())}
                                    </p>
                                    <p className="text-sm text-slate-400 ml-6">
                                        2. {t.rfq.what_next_2}
                                    </p>
                                    <p className="text-sm text-slate-400 ml-6">
                                        3. {t.rfq.what_next_3}
                                    </p>
                                </div>
                            </div>

                            <label className="flex items-center gap-3 mb-8 cursor-pointer group select-none">
                                <input
                                    type="checkbox"
                                    required
                                    name="consent"
                                    checked={formData.consent}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-orange-500 rounded border-slate-600 bg-slate-800 focus:ring-orange-500"
                                />
                                <span className="text-sm text-slate-400 group-hover:text-white transition-colors">
                                    {t.rfq.consent_label}
                                </span>
                            </label>

                            <div className="flex justify-between mt-8 pt-6 border-t border-slate-700/50">
                                <button onClick={prevStep} className="text-slate-400 font-medium hover:text-white px-4 transition-colors">{t.common.back}</button>
                                <button
                                    disabled={loading || !formData.consent || !formData.email}
                                    onClick={handleSubmit}
                                    className="bg-emerald-600 text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/30 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 flex items-center gap-2 w-full sm:w-auto justify-center"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {t.rfq.sending}
                                        </>
                                    ) : (
                                        <>{t.rfq.submit_btn}</>
                                    )}
                                </button>
                            </div>

                            {/* Conversion Element: Risk Reversal & Clarity */}
                            <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    {t.rfq.spam_free}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    {t.rfq.data_privacy}
                                </span>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
