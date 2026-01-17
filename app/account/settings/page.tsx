"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { UserProfile } from "@/app/lib/types";
import { Save, Loader2 } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const CITIES = ["Tallinn", "Tartu", "Pärnu", "Narva", "Rakvere", "Viljandi"];

export default function AccountSettings() {
    const [profile, setProfile] = useState<UserProfile>({
        id: "", full_name: "", phone: "", default_city: "Tallinn"
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        const fetch = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (data) setProfile(data as UserProfile);
            else setProfile(prev => ({ ...prev, id: user.id }));

            setLoading(false);
        };
        fetch();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const { error } = await supabase.from("user_profiles").upsert(profile);
        setSaving(false);
        if (error) alert(error.message);
        else alert("Salvestatud!");
    };

    if (loading) return <div>...</div>;

    return (
        <div className="max-w-xl">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">{t.account.nav_settings || "Minu Seaded"}</h1>

            <form onSubmit={handleSave} className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t.account.full_name}</label>
                    <input type="text" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        value={profile.full_name || ""} onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                        placeholder="Eesnimi Perenimi" />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t.account.phone}</label>
                    <input type="text" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        value={profile.phone || ""} onChange={e => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="+372 5555 5555" />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t.account.default_city}</label>
                    <select className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                        value={profile.default_city || "Tallinn"} onChange={e => setProfile({ ...profile, default_city: e.target.value })}>
                        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="pt-4">
                    <button type="submit" disabled={saving} className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2">
                        {saving ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Salvesta</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
