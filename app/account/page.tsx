"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import Link from "next/link";
import { Truck, Clock } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface OrderItem {
    id: string;
    name: string;
    qty: number;
    price: number;
    unit: string;
    line_total: number;
}

interface Order {
    id: string;
    created_at: string;
    total: number;
    status: string;
    items: OrderItem[];
}

export default function AccountOverview() {
    const [lastOrder, setLastOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        const fetch = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("orders")
                .select("*, items(*)")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

            if (data) setLastOrder(data);
            setLoading(false);
        };
        fetch();
    }, []);

    // Helper to create test order
    const createTestOrder = async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        await fetch("/api/orders/create", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + session?.access_token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                items: [
                    { id: "p1", name: "Keraamiline Plaat Retro", price: 25.50, quantity: 2, unit: "m2" },
                    { id: "p2", name: "Kruvid 5x50mm", price: 4.20, quantity: 1, unit: "tk" }
                ],
                totals: { subtotal: 55.20, delivery: 5.00, total: 60.20 },
                delivery: { method: "wolt", split: true, woltItems: ["p2"], woltFee: 5.00, secondaryMethod: "pickup" },
                userDetails: { city: "Tallinn", address: "Pärnu mnt 123", phone: "+37255555555", notes: "Gate code 1234" }
            })
        });
        window.location.reload();
    };

    if (loading) return <div>...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">{t.account.welcome_back || "Tere tulemast tagasi!"}</h1>
                <button onClick={createTestOrder} className="text-xs bg-slate-200 px-2 py-1 rounded hover:bg-slate-300 transition-colors">
                    {t.account.create_test_order}
                </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-slate-500 text-sm mb-1">Viimane tellimus</div>
                        {lastOrder ? (
                            <div className="font-bold text-lg text-slate-900">
                                {new Date(lastOrder.created_at).toLocaleDateString()}
                            </div>
                        ) : (
                            <div className="text-slate-400 italic">Puudub</div>
                        )}
                    </div>
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                        <Clock size={20} />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-900">Viimane tellimus</h3>
                    {lastOrder && (
                        <Link href={`/account/orders/${lastOrder.id}`} className="text-emerald-600 text-sm font-bold hover:underline">
                            Vaata detaile
                        </Link>
                    )}
                </div>
                {lastOrder ? (
                    <div className="p-6">
                        <div className="flex justify-between mb-4">
                            <div>
                                <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">ORDER #{lastOrder.id.slice(0, 8)}</div>
                                <div className="font-bold text-slate-900">{lastOrder.total} €</div>
                            </div>
                            <div className="text-right">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${lastOrder.status === 'completed' ? 'bg-green-100 text-green-700' :
                                    lastOrder.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    {lastOrder.status}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {lastOrder.items?.slice(0, 3).map((item) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span className="text-slate-600">{item.qty}x {item.name}</span>
                                    <span className="font-medium text-slate-900">{item.line_total} €</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="p-12 text-center text-slate-400">
                        {t.account.no_orders || "Tellimuste ajalugu on tühi."}
                    </div>
                )}
            </div>
        </div>
    );
}
