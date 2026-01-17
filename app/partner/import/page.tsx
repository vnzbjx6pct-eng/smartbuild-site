"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { Upload, ArrowRight, CheckCircle, AlertTriangle, FileText, Loader2 } from "lucide-react";

const REQUIRED_FIELDS = ['name_override_et', 'price', 'sku']; // Basic checks on UI side

export default function PartnerImportPage() {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [file, setFile] = useState<File | null>(null);
    const [storeId, setStoreId] = useState<string | null>(null);
    const [importId, setImportId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Mapping: keys are DB fields, values are CSV headers
    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [mapping, setMapping] = useState<Record<string, string>>({
        sku: 'SKU',
        ean: 'EAN',
        name_override_et: 'Nimi',
        brand: 'Bränd',
        price: 'Hind',
        stock_status: 'Laoseis',
        weight_kg: 'Kaal',
        length_cm: 'Pikkus',
        width_cm: 'Laius',
        height_cm: 'Kõrgus',
        hazmat: 'Ohtlik',
        delivery_allowed_wolt: 'Wolt'
    });

    const [preview, setPreview] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>({});

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: membership } = await supabase.from("store_users").select("store_id").eq("user_id", user.id).single();
            if (membership) setStoreId(membership.store_id);
        };
        init();
    }, []);

    const handleUpload = async () => {
        if (!file || !storeId) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("storeId", storeId);

            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch("/api/partner/import/upload", {
                method: "POST",
                headers: { "Authorization": `Bearer ${session?.access_token}` },
                body: formData
            });
            const json = await res.json();
            if (json.error) throw new Error(json.error);

            setImportId(json.importId);

            // Read headers for mapping step (simple local read)
            const text = await file.text();
            const firstLine = text.split('\n')[0];
            const headers = firstLine.split(',').map(h => h.trim().replace(/"/g, ''));
            setCsvHeaders(headers);

            // Auto-map if possible
            const newMap = { ...mapping };
            headers.forEach(h => {
                const hl = h.toLowerCase();
                if (hl.includes('sku')) newMap.sku = h;
                if (hl.includes('ean')) newMap.ean = h;
                if (hl.includes('nimi') || hl.includes('name')) newMap.name_override_et = h;
                if (hl.includes('hind') || hl.includes('price')) newMap.price = h;
                if (hl.includes('bränd') || hl.includes('brand')) newMap.brand = h;
                if (hl.includes('kaal') || hl.includes('weight')) newMap.weight_kg = h;
            });
            setMapping(newMap);

            setStep(2);
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = async () => {
        if (!importId) return;
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch("/api/partner/import/preview", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${session?.access_token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ importId, mapping })
            });
            const json = await res.json();
            if (json.error) throw new Error(json.error);

            setPreview(json.preview);
            setSummary({ total: json.totalRows, valid: json.validRows });
            setStep(3); // Go to preview/apply
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        if (!importId) return;
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch("/api/partner/import/apply", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${session?.access_token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ importId })
            });
            const json = await res.json();
            if (json.error) throw new Error(json.error);

            setSummary({ ...summary, created: json.created, updated: json.updated, failed: json.failed });
            alert(`Import tehtud! Lisatud: ${json.created}, Uuendatud: ${json.updated}, Ebaõnnestus: ${json.failed}`);
            // Reset or Redirect
            setStep(1); setFile(null);
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Import</h1>
            <p className="text-slate-500 mb-8">Lae üles CSV fail toodetega.</p>

            {/* Stepper */}
            <div className="flex items-center gap-4 mb-8 text-sm font-bold border-b border-slate-200 pb-4">
                <div className={`${step >= 1 ? 'text-emerald-600' : 'text-slate-300'}`}>1. Vali fail</div>
                <ArrowRight size={16} className="text-slate-300" />
                <div className={`${step >= 2 ? 'text-emerald-600' : 'text-slate-300'}`}>2. Seadista veerud</div>
                <ArrowRight size={16} className="text-slate-300" />
                <div className={`${step >= 3 ? 'text-emerald-600' : 'text-slate-300'}`}>3. Kinnita</div>
            </div>

            {/* Step 1: Upload */}
            {step === 1 && (
                <div className="bg-white p-12 rounded-xl border-2 border-dashed border-slate-300 text-center hover:bg-slate-50 transition-colors">
                    <input type="file" accept=".csv" onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" id="file" />
                    <label htmlFor="file" className="cursor-pointer block">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Upload size={32} />
                        </div>
                        <div className="font-bold text-lg text-slate-900 mb-2">
                            {file ? file.name : "Vali arvutist CSV fail"}
                        </div>
                        <p className="text-slate-500">
                            Toetatud formaadid: CSV. Maksimaalselt 5MB.
                        </p>
                    </label>
                    {file && (
                        <button onClick={handleUpload} disabled={loading} className="mt-6 bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2 mx-auto">
                            {loading ? <Loader2 className="animate-spin" /> : "Lae üles ja jätka"}
                        </button>
                    )}
                </div>
            )}

            {/* Step 2: Mapping */}
            {step === 2 && (
                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-lg mb-6">Veergude vastavus</h3>
                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
                        {Object.keys(mapping).map(key => (
                            <div key={key} className="flex flex-col">
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1">{key}</label>
                                <select
                                    className="p-3 border border-slate-200 rounded-lg bg-slate-50"
                                    value={mapping[key]}
                                    onChange={e => setMapping({ ...mapping, [key]: e.target.value })}
                                >
                                    <option value="">-- Ignoreeri --</option>
                                    {csvHeaders.map(h => (
                                        <option key={h} value={h}>{h}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 flex justify-end">
                        <button onClick={handlePreview} disabled={loading} className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2">
                            {loading ? <Loader2 className="animate-spin" /> : "Eelvaade ->"}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Preview */}
            {step === 3 && (
                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg">Impordi eelvaade</h3>
                        <div className="flex gap-4 text-sm">
                            <div className="px-3 py-1 bg-slate-100 rounded-full">Kokku: <b>{summary.total}</b> rida</div>
                            {/* In real app, valid is calculated better */}
                        </div>
                    </div>

                    <div className="overflow-x-auto mb-8 border rounded-lg">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-bold">
                                <tr>
                                    <th className="p-3">SKU</th>
                                    <th className="p-3">Nimi</th>
                                    <th className="p-3">Bränd</th>
                                    <th className="p-3">Hind</th>
                                    <th className="p-3">Mõõdud</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {preview.map((row, i) => (
                                    <tr key={i}>
                                        <td className="p-3 font-mono">{row.sku || row.ean || "-"}</td>
                                        <td className="p-3">{row.name_override_et}</td>
                                        <td className="p-3">{row.brand}</td>
                                        <td className="p-3">{row.price}</td>
                                        <td className="p-3 text-xs text-slate-400">
                                            {row.weight_kg}kg, {row.length_cm}x{row.width_cm}x{row.height_cm}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex gap-4 justify-end">
                        <button onClick={() => setStep(2)} className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">
                            Tagasi
                        </button>
                        <button onClick={handleApply} disabled={loading} className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2">
                            {loading ? <Loader2 className="animate-spin" /> : "Kinnita Import"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
