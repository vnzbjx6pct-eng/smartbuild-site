"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { Loader2, Save, Truck, Info, Store } from "lucide-react";
import { StoreDeliverySettings } from "@/app/lib/types";

const CITIES = ["Tallinn", "Tartu", "Pärnu", "Narva", "Rakvere", "Viljandi"];

export default function PartnerDeliveryPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [storeId, setStoreId] = useState<string | null>(null);
    const [settings, setSettings] = useState<StoreDeliverySettings>({
        store_id: "",
        pickup_enabled: true,
        wolt_enabled: false,
        store_delivery_enabled: false,
        cities: [],
        prep_time_min: 30,
        partial_delivery_enabled: true,
        store_delivery_rules_json: {
            min_order_eur: 50,
            fee_eur: 20
        }
    });

    useEffect(() => {
        const fetchSettings = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: membership } = await supabase.from("store_users").select("store_id").eq("user_id", user.id).single();
            if (!membership) return;

            setStoreId(membership.store_id);

            // Try to fetch existing
            const { data } = await supabase.from("store_delivery_settings").select("*").eq("store_id", membership.store_id).single();
            if (data) {
                setSettings(data as StoreDeliverySettings);
            } else {
                // Initialize defaults if not found
                setSettings(prev => ({ ...prev, store_id: membership.store_id }));
            }
            setLoading(false);
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        if (!storeId) return;
        setSaving(true);
        const { error } = await supabase.from("store_delivery_settings").upsert({
            ...settings,
            store_id: storeId
        });
        setSaving(false);
        if (error) alert("Viga: " + error.message);
        else alert("Salvestatud!");
    };

    const toggleCity = (city: string) => {
        const current = settings.cities || [];
        if (current.includes(city)) setSettings({ ...settings, cities: current.filter(c => c !== city) });
        else setSettings({ ...settings, cities: [...current, city] });
    };

    if (loading) return <div>Laen seadeid...</div>;

    return (
        <div className="max-w-3xl">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Tarne seaded</h1>
            <p className="text-slate-500 mb-8">Halda kuidas kliendid kaupa kätte saavad.</p>

            <div className="space-y-6">

                {/* 1. Pickup */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Store size={24} /></div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-lg text-slate-900">Tulen ise järgi (Click & Collect)</h3>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={settings.pickup_enabled} onChange={e => setSettings({ ...settings, pickup_enabled: e.target.checked })} />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                            <p className="text-slate-500 text-sm mb-4">
                                Klient tuleb poodi kaubale ise järgi.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Komplekteerimise aeg (min)</label>
                                    <input type="number" className="w-[100px] p-2 border border-slate-200 rounded"
                                        value={settings.prep_time_min} onChange={e => setSettings({ ...settings, prep_time_min: Number(e.target.value) })} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Wolt */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm opacity-100">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-50 text-blue-400 rounded-lg"><Truck size={24} /></div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                    Wolt Drive
                                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">Kiirtarne</span>
                                </h3>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={settings.wolt_enabled} onChange={e => setSettings({ ...settings, wolt_enabled: e.target.checked })} />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>
                            <p className="text-slate-500 text-sm mb-4">
                                Automaatne kullerteenus (kuni 20kg, 100cm).
                            </p>

                            {settings.wolt_enabled && (
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm">
                                    <div className="flex items-center gap-2 mb-2 font-bold text-slate-700">
                                        <Info size={16} /> Osaline tarne (Partial Delivery)
                                    </div>
                                    <p className="text-slate-500 mb-3">
                                        Kui korvis on tooteid, mis Woltiga ei mahu, kas lubada kliendil tellimust poolitada (osa Woltiga, osa ise järgi)?
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <input type="checkbox" id="partial" checked={settings.partial_delivery_enabled}
                                            onChange={e => setSettings({ ...settings, partial_delivery_enabled: e.target.checked })}
                                            className="w-4 h-4 text-emerald-600 rounded" />
                                        <label htmlFor="partial" className="font-medium">Luba tellimuse poolitamine</label>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Cities */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-900 mb-4">Teeninduspiirkonnad (Linnad)</h3>
                    <div className="flex flex-wrap gap-2">
                        {CITIES.map(city => (
                            <button key={city}
                                onClick={() => toggleCity(city)}
                                className={`px-4 py-2 rounded-full border text-sm font-bold transition-colors ${settings.cities?.includes(city)
                                        ? "bg-emerald-600 text-white border-emerald-600"
                                        : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300"
                                    }`}>
                                {city}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 4. Store Delivery (Placeholder for v1) */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm opacity-70">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-lg text-slate-900">Poe oma transport (Kaubik)</h3>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={settings.store_delivery_enabled} onChange={e => setSettings({ ...settings, store_delivery_enabled: e.target.checked })} />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 peer-checked:bg-emerald-500"></div>
                        </label>
                    </div>
                    {settings.store_delivery_enabled && (
                        <div className="text-sm text-slate-500 mt-2">
                            Min Tellimus: <input type="number" value={settings.store_delivery_rules_json?.min_order_eur} onChange={e => setSettings({ ...settings, store_delivery_rules_json: { ...settings.store_delivery_rules_json, min_order_eur: Number(e.target.value) } })} className="border rounded w-16 p-1 mx-2" /> €
                            <br />
                            Transpordi hind: <input type="number" value={settings.store_delivery_rules_json?.fee_eur} onChange={e => setSettings({ ...settings, store_delivery_rules_json: { ...settings.store_delivery_rules_json, fee_eur: Number(e.target.value) } })} className="border rounded w-16 p-1 mx-2 mt-2" /> €
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-4">
                    <button onClick={handleSave} disabled={saving} className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2">
                        {saving ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Salvesta muudatused</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
