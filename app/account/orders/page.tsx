"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import Link from "next/link";
import { ChevronRight, Package, ShoppingCart } from "lucide-react";
import { Order } from "@/app/lib/types";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filter, setFilter] = useState<'all' | 'active' | 'done'>('active');
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        const fetch = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("orders")
                .select("*, shipments(type)")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (data) setOrders(data as Order[]);
            setLoading(false);
        };
        fetch();
    }, []);

    if (loading) return <div>...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-6">{t.account.nav_orders || "Minu Tellimused"}</h1>

            {/* Filters */}
            <div className="flex gap-2 mb-6 border-b border-slate-200 pb-1">
                <button
                    onClick={() => setFilter('active')}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${filter === 'active' ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Aktiivsed
                </button>
                <button
                    onClick={() => setFilter('done')}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${filter === 'done' ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Lõpetatud
                </button>
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${filter === 'all' ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Kõik
                </button>
            </div>

            <div className="space-y-4">
                {orders.filter(o => {
                    if (filter === 'all') return true;
                    if (filter === 'active') return ['draft', 'submitted', 'confirmed'].includes(o.status);
                    if (filter === 'done') return ['completed', 'cancelled'].includes(o.status);
                    return true;
                }).length === 0 ? (
                    <div className="py-16 text-center bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                            <Package size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{t.account.no_orders}</h3>
                        <p className="text-slate-500 mb-6 max-w-xs">{t.cart.empty_text || "Lisa tooteid kataloogist, et võrrelda hindu ja küsida pakkumist."}</p>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-xl transition-colors"
                        >
                            <ShoppingCart size={18} />
                            {t.products.back_to_catalog}
                        </Link>
                    </div>
                ) : (
                    orders.filter(o => {
                        if (filter === 'all') return true;
                        if (filter === 'active') return ['draft', 'submitted', 'confirmed'].includes(o.status);
                        if (filter === 'done') return ['completed', 'cancelled'].includes(o.status);
                        return true;
                    }).map(order => (
                        <Link key={order.id} href={`/account/orders/${order.id}`} className="block bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-500 transition-all group">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="font-bold text-slate-900 text-lg">#{order.id.slice(0, 8)}</span>
                                        <div className="text-xs text-slate-400">{new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString().slice(0, 5)}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* Shipments Badges */}
                                        {order.shipments?.map((s: any, idx) => (
                                            <span key={idx} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded capitalize font-medium">
                                                {s.type === 'wolt' ? '🚀 ' : ''}{(t.account as any)[`type_${s.type}`] || s.type}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-black text-xl text-slate-900 mb-1">{order.total.toFixed(2)} €</div>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {(t.account as any)[`status_${order.status}`] || order.status}
                                    </span>
                                </div>
                                <div className="pl-4 text-slate-300 group-hover:text-emerald-500 transition-colors">
                                    <ChevronRight />
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
