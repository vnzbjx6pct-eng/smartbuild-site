"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import Link from "next/link";
import { Package, Upload, AlertCircle, CheckCircle } from "lucide-react";

export default function PartnerDashboardPage() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        activeProducts: 0,
        lastImportStatus: "none" as string | null,
        lastImportDate: null as string | null
    });
    const [loading, setLoading] = useState(true);
    // const supabase = createClient(); // Removed

    useEffect(() => {
        const fetchStats = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get store id first
            const { data: membership } = await supabase
                .from("store_users")
                .select("store_id")
                .eq("user_id", user.id)
                .single();

            if (!membership) return;

            // Parallel fetch
            const [prodCount, activeCount, lastImport] = await Promise.all([
                supabase.from("store_products").select("*", { count: 'exact', head: true }).eq("store_id", membership.store_id),
                supabase.from("store_products").select("*", { count: 'exact', head: true }).eq("store_id", membership.store_id).eq("stock_status", "in_stock"),
                supabase.from("imports").select("status, created_at").eq("store_id", membership.store_id).order("created_at", { ascending: false }).limit(1).single()
            ]);

            setStats({
                totalProducts: prodCount.count || 0,
                activeProducts: activeCount.count || 0,
                lastImportStatus: lastImport.data ? lastImport.data.status : "none",
                lastImportDate: lastImport.data ? new Date(lastImport.data.created_at).toLocaleDateString("et-EE") : null
            });
            setLoading(false);
        };

        fetchStats();
    }, []);

    if (loading) return <div>Laen andmeid...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Töölaud</h1>
            <p className="text-slate-500 mb-8">Ülevaade kaupluse tegevusest.</p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
                {/* CARD 1 */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Package size={24} />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase">Tooteid</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 mb-1">{stats.totalProducts}</div>
                    <div className="text-sm text-slate-500">
                        Aktiivseid: <span className="font-bold text-slate-700">{stats.activeProducts}</span>
                    </div>
                </div>

                {/* CARD 2 */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <Upload size={24} />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase">Viimane Import</span>
                    </div>
                    {stats.lastImportStatus !== 'none' ? (
                        <>
                            <div className="text-xl font-bold text-slate-900 mb-1 capitalize flex items-center gap-2">
                                {stats.lastImportStatus === 'applied' && <CheckCircle size={18} className="text-emerald-500" />}
                                {stats.lastImportStatus === 'failed' && <AlertCircle size={18} className="text-red-500" />}
                                {stats.lastImportStatus}
                            </div>
                            <div className="text-sm text-slate-500">
                                {stats.lastImportDate}
                            </div>
                        </>
                    ) : (
                        <div className="text-slate-400 italic">Pole veel imporditud</div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <h2 className="text-lg font-bold text-slate-900 mb-4">Kiired tegevused</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/partner/products/new" className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-lg hover:border-emerald-500 hover:shadow-md transition-all group">
                    <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                        <span className="font-bold text-xl">+</span>
                    </div>
                    <span className="font-medium text-slate-700">Lisa toode</span>
                </Link>
                <Link href="/partner/import" className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all group">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                        <Upload size={20} />
                    </div>
                    <span className="font-medium text-slate-700">Impordi CSV</span>
                </Link>
            </div>
        </div>
    );
}
