"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import Link from "next/link";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import type { StoreProduct } from "@/app/lib/types";

export default function PartnerProductsPage() {
    const [products, setProducts] = useState<StoreProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    // const supabase = createClient(); // Removed

    useEffect(() => {
        const fetchProducts = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get store id
            const { data: membership } = await supabase
                .from("store_users")
                .select("store_id")
                .eq("user_id", user.id)
                .single();

            if (!membership) return;

            const { data, error } = await supabase
                .from("store_products")
                .select("*")
                .eq("store_id", membership.store_id)
                .order("updated_at", { ascending: false });

            if (data) setProducts(data as StoreProduct[]);
            setLoading(false);
        };

        fetchProducts();
    }, []);

    const filtered = products.filter(p =>
        (p.name_override_et || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.brand || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div>Laen tooteid...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Tooted</h1>
                    <p className="text-slate-500">Halda poe sortimenti ja hindu.</p>
                </div>
                <Link href="/partner/products/new" className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2">
                    <Plus size={18} />
                    Lisa toode
                </Link>
            </div>

            {/* Search */}
            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Otsi nime, SKU või brändi järgi..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                        <tr>
                            <th className="px-6 py-4">Nimetus</th>
                            <th className="px-6 py-4">Bränd</th>
                            <th className="px-6 py-4">Hind</th>
                            <th className="px-6 py-4">Laoseis</th>
                            <th className="px-6 py-4">Logistika</th>
                            <th className="px-6 py-4 text-right">Tegevused</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                    Tooteid ei leitud. Lisa uus või impordi CSV.
                                </td>
                            </tr>
                        ) : (
                            filtered.map(product => (
                                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">{product.name_override_et || "Nimetus puudub"}</div>
                                        <div className="text-xs text-slate-400 font-mono">{product.sku || product.ean || "NO_CODE"}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{product.brand}</td>
                                    <td className="px-6 py-4 font-bold text-slate-900">{product.price.toFixed(2)} €</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.stock_status === 'in_stock' ? 'bg-green-100 text-green-700' :
                                            product.stock_status === 'out_of_stock' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {product.stock_status === 'in_stock' ? 'Laos' :
                                                product.stock_status === 'out_of_stock' ? 'Otsas' : product.stock_status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {product.missing_dimensions ? (
                                            <span className="text-xs text-red-500 font-bold bg-red-50 px-2 py-1 rounded border border-red-100" title="Mõõdud puuduvad - Wolt keelatud">
                                                ! Mõõdud
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-500">
                                                {product.weight_kg}kg
                                            </span>
                                        )}
                                        {product.delivery_allowed_wolt && !product.missing_dimensions && (
                                            <span className="ml-2 text-xs text-emerald-600 font-bold bg-emerald-50 px-1 rounded">W</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit size={16} />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
