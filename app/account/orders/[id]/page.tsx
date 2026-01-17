"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Package, Truck } from "lucide-react";
import { Order } from "@/app/lib/types";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function OrderDetailsPage() {
    const params = useParams();
    const id = params?.id as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    const refresh = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !id) return;

        const { data } = await supabase
            .from("orders")
            .select(`
                *,
                items(*),
                shipments(*, events:shipment_events(*))
            `)
            .eq("id", id)
            .eq("user_id", user.id)
            .single();

        if (data) setOrder(data as any);
        setLoading(false);
    };

    useEffect(() => {
        refresh();
    }, [id]);

    // Test helper
    const updateShipmentStatus = async (shipmentId: string, status: string) => {
        const { data: { session } } = await supabase.auth.getSession();
        await fetch("/api/shipments/update", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + session?.access_token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ shipmentId, status, message: `Manual update to ${status}` })
        });
        refresh(); // Reload to see timeline
    };

    if (loading) return <div>...</div>;
    if (!order) return <div>Tellimust ei leitud.</div>;

    return (
        <div>
            <Link href="/account/orders" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 font-medium">
                <ArrowLeft size={18} />
                {t.account.back_to_orders}
            </Link>

            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 mb-2">{t.account.order_nr}{order.id.slice(0, 8)}</h1>
                    <div className="text-slate-500">
                        {new Date(order.created_at).toLocaleString()}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-black text-slate-900 mb-1">{order.total.toFixed(2)} €</div>
                    <div className="text-sm text-slate-500 capitalize">{order.payment_status}</div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">

                {/* LEFT: Shipments & Items */}
                <div className="lg:col-span-2 space-y-8">
                    {order.shipments?.map((shipment, sIdx) => (
                        <div key={shipment.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    {shipment.type === 'wolt' ? (
                                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded flex items-center justify-center"><Truck size={18} /></div>
                                    ) : (
                                        <div className="w-8 h-8 bg-slate-200 text-slate-600 rounded flex items-center justify-center"><Package size={18} /></div>
                                    )}
                                    <div>
                                        <div className="font-bold text-slate-900 capitalize flex items-center gap-2">
                                            {(t.account as any)[`type_${shipment.type}`] || shipment.type}
                                            {/* Dev Tools: Quick Status Update */}
                                            <div className="flex gap-1 ml-4 opacity-20 hover:opacity-100 transition-opacity">
                                                <button onClick={() => updateShipmentStatus(shipment.id, 'dispatched')} className="text-[10px] bg-slate-200 px-1 rounded">Dev: Dispatch</button>
                                                <button onClick={() => updateShipmentStatus(shipment.id, 'delivered')} className="text-[10px] bg-green-200 px-1 rounded">Dev: Deliver</button>
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-500">ID: {shipment.id.slice(0, 8)}</div>
                                    </div>
                                </div>
                                <span className="uppercase font-bold text-xs bg-white border border-slate-200 px-3 py-1 rounded-full">
                                    {(t.account as any)[`shipment_${shipment.status}`] || shipment.status}
                                </span>
                            </div>

                            {/* Timeline */}
                            {shipment.events && shipment.events.length > 0 && (
                                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                    <div className="space-y-4">
                                        {shipment.events.map((ev, eIdx) => (
                                            <div key={ev.id} className="flex gap-4 relative">
                                                {/* Line */}
                                                {eIdx < (shipment.events?.length || 0) - 1 && (
                                                    <div className="absolute left-[9px] top-6 bottom-[-20px] w-0.5 bg-slate-200"></div>
                                                )}
                                                <div className={`shrink-0 w-5 h-5 rounded-full z-10 ${eIdx === 0 ? 'bg-emerald-500 ring-4 ring-emerald-500/20' : 'bg-slate-300'
                                                    }`}></div>
                                                <div>
                                                    <div className="font-bold text-sm text-slate-900 capitalize">
                                                        {(t.account as any)[`shipment_${ev.event_status}`] || ev.event_status}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {new Date(ev.created_at).toLocaleString()} — {ev.message || (t.account as any)[`timeline_${ev.event_status}`]}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Items */}
                            <div className="p-6">
                                <h4 className="font-bold text-sm text-slate-500 uppercase mb-4">{t.account.items_in_package}</h4>
                                <div className="space-y-3">
                                    {order.items?.filter(i => i.shipment_id === shipment.id).map(item => (
                                        <div key={item.id} className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center text-slate-400 font-bold">
                                                    {item.qty}x
                                                </div>
                                                <span className="font-medium text-slate-700">{item.name}</span>
                                            </div>
                                            <span className="text-slate-900 font-bold">{item.line_total.toFixed(2)} €</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* RIGHT: Meta */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 border-b pb-2">{t.account.delivery_info}</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex gap-2">
                                <MapPin className="text-slate-400 shrink-0" size={16} />
                                <div>
                                    <div className="font-bold text-slate-700">{order.city}</div>
                                    <div className="text-slate-500">{order.address_line}</div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Phone className="text-slate-400 shrink-0" size={16} />
                                <div className="text-slate-700">{order.phone}</div>
                            </div>
                            <div className="flex gap-2">
                                <div className="text-slate-400 shrink-0 w-4 font-bold">N</div>
                                <div className="text-slate-500 italic">{order.notes || "Märkused puuduvad"}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 border-b pb-2">{t.account.order_summary}</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-slate-600">
                                <span>{t.account.goods}</span>
                                <span>{order.subtotal.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>{t.account.delivery}</span>
                                <span>{order.delivery_fee.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between text-slate-900 font-black text-lg pt-2 border-t mt-2">
                                <span>{t.account.total}</span>
                                <span>{order.total.toFixed(2)} €</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <button
                        disabled
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t.account.repeat_order} (Coming Soon)
                    </button>
                </div>
            </div>
        </div>
    );
}
