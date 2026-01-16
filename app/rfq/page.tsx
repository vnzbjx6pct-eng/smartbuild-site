"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import Link from "next/link";
import { SUPPORTED_STORES, SUPPORTED_CITIES, StoreName, CityName } from "@/app/lib/storeContacts";

const CITIES = SUPPORTED_CITIES;

export default function RFQWizardPage() {
    const { items, clear } = useCart();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        city: "Pärnu" as CityName,
        company: "",
        notes: "",
        consent: false,
    });

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
    const validateStep1 = () => {
        if (!formData.email || !formData.email.includes("@")) return false;
        if (!formData.city) return false;
        return true;
    };

    const validateStep2 = () => {
        return selectedStores.length > 0;
    };

    // Submit
    const handleSubmit = async () => {
        if (!formData.consent) {
            alert("Palun kinnitage nõusolek andmete edastamiseks.");
            return;
        }

        setLoading(true);
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
            if (!res.ok) throw new Error(data.error || "Viga päringu saatmisel");

            setSuccess(true);
            clear();
            window.scrollTo(0, 0);
        } catch (err: any) {
            alert("Viga: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Rendering
    if (success) {
        return (
            <div className="mx-auto max-w-xl px-4 py-20 text-center animate-in zoom-in-95 duration-300">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                    <svg className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-slate-900">Päring saadetud!</h1>
                <p className="mt-4 text-lg text-slate-600">
                    Poed vaatavad teie soovi üle ja vastavad otse e-posti teel.<br />
                    Tavaliselt võtab see aega 1-2 tööpäeva.
                </p>
                <Link href="/" className="mt-8 inline-block rounded-2xl bg-slate-900 px-8 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                    Tagasi avalehele
                </Link>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-16 text-center">
                <h1 className="text-3xl font-bold text-slate-900 mb-4">Ostukorv on tühi</h1>
                <p className="text-slate-600 mb-8">Hinnapäringu koostamiseks lisa esmalt tooteid kataloogist.</p>
                <Link href="/products" className="rounded-xl bg-orange-500 px-6 py-3 text-white font-bold hover:bg-orange-600">
                    Ava kataloog
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Hinnapäring</h1>

            {/* Progress Bar */}
            <div className="flex items-center gap-4 mb-10 text-sm font-medium border-b border-slate-200 pb-4 overflow-x-auto">
                <div className={`whitespace-nowrap ${step >= 1 ? 'text-slate-900' : 'text-slate-400'}`}>1. Kontaktandmed</div>
                <div className="text-slate-300">→</div>
                <div className={`whitespace-nowrap ${step >= 2 ? 'text-slate-900' : 'text-slate-400'}`}>2. Vali poed</div>
                <div className="text-slate-300">→</div>
                <div className={`whitespace-nowrap ${step >= 3 ? 'text-slate-900' : 'text-slate-400'}`}>3. Kinnitus</div>
            </div>

            <div className="grid lg:grid-cols-12 gap-10">

                {/* Main Content Area */}
                <div className="lg:col-span-12 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">

                    {/* STEP 1: CONTACT */}
                    {step === 1 && (
                        <div className="animate-in slide-in-from-left-4 fade-in duration-300">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Sinu andmed</h2>
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">E-post *</label>
                                    <input autoFocus required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 focus:bg-white transition-colors" placeholder="sinu@email.ee" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Linn *</label>
                                    <select name="city" value={formData.city} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 focus:bg-white">
                                        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nimi</label>
                                    <input name="name" value={formData.name} onChange={handleChange} type="text" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 focus:bg-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                                    <input name="phone" value={formData.phone} onChange={handleChange} type="tel" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 focus:bg-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Ettevõte</label>
                                    <input name="company" value={formData.company} onChange={handleChange} type="text" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 focus:bg-white" />
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end">
                                <button onClick={() => validateStep1() ? setStep(2) : alert("Palun täida nõutud väljad (E-post)")} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-transform active:scale-95">
                                    Edasi →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: STORES */}
                    {step === 2 && (
                        <div className="animate-in slide-in-from-right-4 fade-in duration-300">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Vali poed</h2>
                            <p className="text-slate-500 mb-6">Vali, millistest poodidest soovid pakkumist küsida.</p>

                            <div className="grid sm:grid-cols-2 gap-4 mb-8">
                                {SUPPORTED_STORES.map((store) => (
                                    <label key={store} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selectedStores.includes(store) ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500' : 'border-slate-200 hover:bg-slate-50'}`}>
                                        <input
                                            type="checkbox"
                                            checked={selectedStores.includes(store)}
                                            onChange={() => toggleStore(store)}
                                            className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
                                        />
                                        <span className="font-bold text-slate-900">{store}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
                                <button onClick={() => setStep(1)} className="text-slate-500 font-medium hover:text-slate-900 px-4">← Tagasi</button>
                                <button onClick={() => validateStep2() ? setStep(3) : alert("Palun vali vähemalt üks pood")} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-transform active:scale-95">
                                    Edasi →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: CONFIRM */}
                    {step === 3 && (
                        <div className="animate-in zoom-in-95 fade-in duration-300">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Kinnitus</h2>

                            <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100 space-y-4">
                                <div className="flex justify-between text-sm border-b border-slate-200 pb-2">
                                    <span className="text-slate-500">Kellele:</span>
                                    <span className="font-semibold text-slate-900">{selectedStores.join(", ")}</span>
                                </div>
                                <div className="flex justify-between text-sm border-b border-slate-200 pb-2">
                                    <span className="text-slate-500">Kontakt:</span>
                                    <span className="font-semibold text-slate-900">{formData.email}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Tooteid:</span>
                                    <span className="font-semibold text-slate-900">{items.length} tk</span>
                                </div>
                            </div>

                            <label className="block text-sm font-medium text-slate-700 mb-2">Lisakommentaar (valikuline)</label>
                            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900 bg-white mb-6" placeholder="Nt. soovin transporti objektile..." />

                            <label className="flex items-start gap-3 mb-8 cursor-pointer group p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                                <input
                                    type="checkbox"
                                    required
                                    name="consent"
                                    checked={formData.consent}
                                    onChange={handleChange}
                                    className="mt-1 w-5 h-5 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                                />
                                <span className="text-sm text-slate-600 group-hover:text-slate-900">
                                    Kinnitan, et soovin saata hinnapäringu valitud poodidele.
                                </span>
                            </label>

                            <div className="flex justify-between mt-8">
                                <button onClick={() => setStep(2)} className="text-slate-500 font-medium hover:text-slate-900 px-4">← Tagasi</button>
                                <button
                                    disabled={loading || !formData.consent}
                                    onClick={handleSubmit}
                                    className="bg-emerald-600 text-white px-10 py-4 rounded-xl font-bold shadow-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
                                >
                                    {loading ? "Saadan..." : "Saada päring"}
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
