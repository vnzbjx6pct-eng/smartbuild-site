"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

export default function PartnerProfilePage() {
    const [store, setStore] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStore = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            // Get store
            const { data: membership } = await supabase.from("store_users").select("store_id, stores(*)").eq("user_id", user.id).single();
            if (membership && membership.stores) {
                // @ts-ignore
                setStore(membership.stores);
            }
            setLoading(false);
        };
        fetchStore();
    }, []);

    if (loading) return <div>Laen andmeid...</div>;
    if (!store) return <div>Poodi ei leitud.</div>;

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Poe profiil</h1>
            <p className="text-slate-500 mb-8">Üldised andmed.</p>

            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-500 uppercase mb-1">Nimi</label>
                        <div className="text-lg font-medium text-slate-900">{store.name}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-500 uppercase mb-1">Bränd</label>
                        <div className="text-lg font-medium text-slate-900">{store.brand_name}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-500 uppercase mb-1">Linn</label>
                        <div className="text-lg font-medium text-slate-900">{store.city}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-500 uppercase mb-1">Aadress</label>
                        <div className="text-lg font-medium text-slate-900">{store.address}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-500 uppercase mb-1">E-post</label>
                        <div className="text-lg font-medium text-slate-900">{store.contact_email}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-500 uppercase mb-1">Telefon</label>
                        <div className="text-lg font-medium text-slate-900">{store.phone}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-500 uppercase mb-1">Staatus</label>
                        <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold uppercase">
                            {store.status}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
