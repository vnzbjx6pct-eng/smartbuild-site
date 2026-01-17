"use client";

import { useState } from "react";
import { Plus, Trash2, CheckCircle2, Building2, User, MapPin, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

// Predefined cities for quick selection
const PREDEFINED_CITIES = ["Tallinn", "Tartu", "Pärnu", "Narva", "Rakvere", "Viljandi"];

type Manager = {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
};

type StoreDraft = {
    city: string;
    storeName: string;
    generalEmail: string;
    managers: Manager[];
};

export default function JoinForm() {
    // Wizard State
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Form Data
    const [companyName, setCompanyName] = useState("");
    const [brandName, setBrandName] = useState("");
    const [adminEmail, setAdminEmail] = useState("");
    const [selectedCities, setSelectedCities] = useState<string[]>([]);
    const [stores, setStores] = useState<Record<string, StoreDraft>>({});

    // --- LOGIC ---

    const toggleCity = (city: string) => {
        if (selectedCities.includes(city)) {
            setSelectedCities(prev => prev.filter(c => c !== city));
            const newStores = { ...stores };
            delete newStores[city];
            setStores(newStores);
        } else {
            setSelectedCities(prev => [...prev, city]);
            setStores(prev => ({
                ...prev,
                [city]: {
                    city,
                    storeName: `${brandName} ${city}`,
                    generalEmail: "",
                    managers: [
                        { id: crypto.randomUUID(), name: "", email: "", isActive: true }
                    ]
                }
            }));
        }
    };

    const addManager = (city: string) => {
        setStores(prev => ({
            ...prev,
            [city]: {
                ...prev[city],
                managers: [...prev[city].managers, { id: crypto.randomUUID(), name: "", email: "", isActive: true }]
            }
        }));
    };

    const removeManager = (city: string, managerId: string) => {
        setStores(prev => ({
            ...prev,
            [city]: {
                ...prev[city],
                managers: prev[city].managers.filter(m => m.id !== managerId)
            }
        }));
    };

    const updateManager = (city: string, managerId: string, field: keyof Manager, value: any) => {
        setStores(prev => ({
            ...prev,
            [city]: {
                ...prev[city],
                managers: prev[city].managers.map(m => m.id === managerId ? { ...m, [field]: value } : m)
            }
        }));
    };

    const handleNext = () => {
        if (currentStep === 1) {
            if (!companyName || !brandName || !adminEmail) return alert("Palun täitke kõik väljad.");
        }
        if (currentStep === 2) {
            if (selectedCities.length === 0) return alert("Valige vähemalt üks linn.");
        }
        setCurrentStep(prev => prev + 1);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Simulate API
        await new Promise(r => setTimeout(r, 1500));
        console.log("ACTIVATING PARTNER:", { companyName, brandName, stores });
        setIsSuccess(true);
        setIsSubmitting(false);
        window.scrollTo(0, 0);
    };

    // --- RENDER ---

    if (isSuccess) {
        return (
            <div className="bg-emerald-50 border border-emerald-100 p-10 rounded-3xl text-center max-w-2xl mx-auto shadow-sm animate-in zoom-in-50 duration-500">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Partnerlus aktiveeritud!</h2>
                <div className="text-lg text-slate-600 mb-8 leading-relaxed">
                    Täname, <strong>{companyName}</strong>.<br />
                    Teie kontod on loodud ja süsteem on valmis päringuid vastu võtma.
                </div>

                <div className="flex flex-col gap-4 max-w-sm mx-auto">
                    <Link
                        href="/partner/trust-dashboard"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                        <ShieldCheck size={20} />
                        Ava Usaldusportaal (Dashboard)
                    </Link>
                    <Link href="/" className="text-slate-500 text-sm hover:text-slate-800 underline">
                        Tagasi avalehele
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">

            {/* PROGRESS INDICATOR */}
            <div className="flex justify-between mb-8 px-4">
                {[1, 2, 3, 4].map(step => (
                    <div key={step} className="flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step <= currentStep ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                            }`}>
                            {step}
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                            {step === 1 && "Start"}
                            {step === 2 && "Linnad"}
                            {step === 3 && "Inimesed"}
                            {step === 4 && "Kinnitus"}
                        </span>
                    </div>
                ))}
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 min-h-[400px]">

                {/* STEP 1: INFO */}
                {currentStep === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Building2 className="text-emerald-500" />
                            Ettevõtte andmed
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Juriidiline nimi *</label>
                                <input
                                    required
                                    value={companyName}
                                    onChange={e => setCompanyName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    placeholder="OÜ Ehitusmeister"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Bränd (Poe nimi) *</label>
                                <input
                                    required
                                    value={brandName}
                                    onChange={e => setBrandName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    placeholder="nt. ProfiEhitus"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Konto administraatori e-post *</label>
                                <input
                                    required
                                    type="email"
                                    value={adminEmail}
                                    onChange={e => setAdminEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    placeholder="tegevjuht@firma.ee"
                                />
                                <p className="text-xs text-slate-500 mt-2">Kasutame seda partnerlepingu ja igakuise statistika saatmiseks.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: CITIES */}
                {currentStep === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <MapPin className="text-emerald-500" />
                            Tegevuspiirkonnad
                        </h2>
                        <p className="text-slate-600">Valige linnad, kus soovite ehitusmaterjalide hinnapäringuid vastu võtta.</p>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {PREDEFINED_CITIES.map(city => (
                                <button
                                    key={city}
                                    type="button"
                                    onClick={() => toggleCity(city)}
                                    className={`p-4 rounded-xl border text-left transition-all ${selectedCities.includes(city)
                                            ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                                            : 'bg-white border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="font-bold text-lg mb-1">{city}</div>
                                    <div className="text-xs text-slate-500">
                                        {selectedCities.includes(city) ? 'Aktiivne' : 'Vali linn'}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 3: MANAGERS */}
                {currentStep === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex justify-between items-end">
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                <User className="text-emerald-500" />
                                Kontaktisikud
                            </h2>
                            <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100 font-medium">
                                {selectedCities.length} linna valitud
                            </span>
                        </div>

                        {selectedCities.map(city => (
                            <div key={city} className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-slate-800 text-lg">{city} esindus</h4>
                                    <button
                                        onClick={() => addManager(city)}
                                        className="text-xs bg-white border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 shadow-sm"
                                    >
                                        <Plus size={14} /> Lisa kontakt
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {stores[city]?.managers.map(mgr => (
                                        <div key={mgr.id} className="flex gap-2">
                                            <input
                                                placeholder="Nimi"
                                                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                                value={mgr.name}
                                                onChange={e => updateManager(city, mgr.id, 'name', e.target.value)}
                                            />
                                            <input
                                                placeholder="E-post"
                                                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                                value={mgr.email}
                                                onChange={e => updateManager(city, mgr.id, 'email', e.target.value)}
                                            />
                                            <button onClick={() => removeManager(city, mgr.id)} className="text-slate-400 hover:text-red-500 p-2">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* STEP 4: CONFIRMATION */}
                {currentStep === 4 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <ShieldCheck className="text-emerald-500" />
                            Kinnitus
                        </h2>

                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
                            <div className="flex justify-between border-b border-slate-200 pb-4">
                                <span className="text-slate-500">Ettevõte</span>
                                <span className="font-bold text-slate-900">{companyName} ({brandName})</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200 pb-4">
                                <span className="text-slate-500">Administraator</span>
                                <span className="font-bold text-slate-900">{adminEmail}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block mb-2">Aktiveeritavad piirkonnad ({selectedCities.length})</span>
                                <div className="flex flex-wrap gap-2">
                                    {selectedCities.map(c => (
                                        <span key={c} className="bg-white border border-slate-200 px-3 py-1 rounded-full text-sm font-medium text-slate-700 shadow-sm">
                                            {c}: {stores[c]?.managers.length} kontakti
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 text-blue-800 text-sm">
                            <div className="mt-0.5">ℹ️</div>
                            <p>
                                Aktiveerimisel luuakse Teie poele automaatselt konto ja SmartBuildi süsteem hakkab suunama {selectedCities.join(", ")} piirkonna päringuid Teie sisestatud kontaktidele.
                            </p>
                        </div>
                    </div>
                )}

                {/* NAVIGATION */}
                <div className="flex justify-between pt-8 mt-8 border-t border-slate-100">
                    {currentStep > 1 ? (
                        <button
                            onClick={() => setCurrentStep(prev => prev - 1)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors"
                        >
                            <ArrowLeft size={18} /> Tagasi
                        </button>
                    ) : <div></div>}

                    {currentStep < 4 ? (
                        <button
                            onClick={handleNext}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors"
                        >
                            Edasi <ArrowRight size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/30 disabled:opacity-50"
                        >
                            {isSubmitting ? "Aktiveerimine..." : "Aktiveeri Partnerlus"}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
