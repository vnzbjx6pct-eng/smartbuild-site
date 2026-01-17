"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function AddProductPage() {
    const [loading, setLoading] = useState(false);
    const [storeId, setStoreId] = useState<string | null>(null);
    const router = useRouter();
    // const supabase = createClient(); // Removed

    const [form, setForm] = useState({
        name_override_et: "",
        brand: "",
        sku: "",
        price: "",
        weight_kg: "",
        length_cm: "",
        width_cm: "",
        height_cm: "",
        delivery_allowed_wolt: true,
        stock_status: "in_stock"
    });

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: membership } = await supabase.from("store_users").select("store_id").eq("user_id", user.id).single();
            if (membership) setStoreId(membership.store_id);
        };
        init();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!storeId) return;
        setLoading(true);

        const weight = parseFloat(form.weight_kg);
        const l = parseFloat(form.length_cm);
        const w = parseFloat(form.width_cm);
        const h = parseFloat(form.height_cm);

        const missing_dimensions = isNaN(weight) || isNaN(l) || isNaN(w) || isNaN(h);

        const { error } = await supabase.from("store_products").insert({
            store_id: storeId,
            name_override_et: form.name_override_et,
            brand: form.brand,
            sku: form.sku,
            price: parseFloat(form.price),
            stock_status: form.stock_status,
            weight_kg: isNaN(weight) ? null : weight,
            length_cm: isNaN(l) ? null : l,
            width_cm: isNaN(w) ? null : w,
            height_cm: isNaN(h) ? null : h,
            missing_dimensions,
            delivery_allowed_wolt: form.delivery_allowed_wolt,
            // Defaults
            currency: 'EUR',
            hazmat: false,
            pickup_allowed: true,
            store_delivery_allowed: true
        });

        if (error) {
            alert("Viga salvestamisel: " + error.message);
        } else {
            router.push("/partner/products");
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Link href="/partner/products" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 font-medium">
                <ArrowLeft size={18} />
                Tagasi toodete nimekirja
            </Link>

            <h1 className="text-2xl font-bold text-slate-900 mb-8">Lisa uus toode</h1>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">

                {/* Basic Info */}
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-900 border-b pb-2">Põhiinfo</h3>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Toote nimetus (ET) *</label>
                        <input required type="text" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                            value={form.name_override_et} onChange={e => setForm({ ...form, name_override_et: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Bränd</label>
                            <input type="text" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">SKU / Tootekood</label>
                            <input type="text" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Hind (€) *</label>
                            <input required type="number" step="0.01" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Laoseis</label>
                            <select className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                value={form.stock_status} onChange={e => setForm({ ...form, stock_status: e.target.value })}>
                                <option value="in_stock">Laos</option>
                                <option value="out_of_stock">Otsas</option>
                                <option value="limited">Piiratud</option>
                                <option value="preorder">Tellimisel</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Logistics */}
                <div className="space-y-4 pt-4">
                    <h3 className="font-bold text-slate-900 border-b pb-2">Mõõdud ja kaal (Wolt jaoks vajalik)</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Kaal (kg)</label>
                            <input type="number" step="0.001" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                value={form.weight_kg} onChange={e => setForm({ ...form, weight_kg: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Pikkus (cm)</label>
                            <input type="number" step="0.1" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                value={form.length_cm} onChange={e => setForm({ ...form, length_cm: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Laius (cm)</label>
                            <input type="number" step="0.1" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                value={form.width_cm} onChange={e => setForm({ ...form, width_cm: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Kõrgus (cm)</label>
                            <input type="number" step="0.1" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                value={form.height_cm} onChange={e => setForm({ ...form, height_cm: e.target.value })} />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <input type="checkbox" id="wolt" className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                            checked={form.delivery_allowed_wolt} onChange={e => setForm({ ...form, delivery_allowed_wolt: e.target.checked })} />
                        <label htmlFor="wolt" className="text-slate-700 font-medium">Luba Wolt kiirkulleriga saatmine</label>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-200">
                    <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-colors flex justify-center items-center gap-2">
                        {loading ? "Salvestan..." : <><Save /> Salvesta toode</>}
                    </button>
                </div>

            </form>
        </div>
    );
}
