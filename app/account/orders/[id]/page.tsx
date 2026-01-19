"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, MapPin, Package, Phone, AlertCircle, Truck, Info, ChevronRight, HelpCircle, Star, Repeat, FileText, AlertTriangle, XCircle } from "lucide-react";
import { supabase } from "@/app/lib/supabaseClient";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { Order, OrderItem, Shipment } from "@/app/lib/types";
import { getDeliveryUXState, DeliveryUXState } from "@/app/lib/delivery/ux";
import { DeliverySeverity, DeliveryAction } from "@/app/lib/delivery/reasonCodes";

// --- VIEW MODEL ---
type TimelineStep = {
    id: string;
    label: string;
    completed: boolean;
    current: boolean;
    date?: string;
    icon: any;
};

type OrderViewModel = {
    id: string;
    displayId: string;
    humanStatus: {
        text: string;
        color: "green" | "blue" | "amber" | "red" | "slate";
        icon: any;
        description?: string;
    };
    uxState: DeliveryUXState;
    eta?: {
        label: string;
        value: string; // "Today 17:00-19:00"
        isDelayed: boolean;
    };
    timeline: TimelineStep[];
    groups: {
        title: string;
        items: (OrderItem & { image?: string })[];
        shipment?: Shipment;
    }[];
    delivery: {
        address: string;
        contact: string;
        method: string;
    };
};

export default function OrderDetailsPage() {
    const params = useParams();
    const id = params?.id as string;
    const { t } = useLanguage();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>("today"); // 'today' | 'later'

    // --- DATA FETCHING ---
    useEffect(() => {
        const fetchOrder = async () => {
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
        fetchOrder();
    }, [id]);

    // --- LOGIC: MAP TO VIEW MODEL ---
    const model: OrderViewModel | null = useMemo(() => {
        if (!order) return null;

        const dict = (t as any).order_details;
        const dictReasons = (t as any).delivery?.reasons || {};
        const dictAcc = (t as any).account;

        // 1. Status Logic
        // Simple logic: if any shipment is 'dispatched', global is 'in_progress'. 
        // If all 'delivered', global 'completed'.
        // If any 'delayed' (mock logic), global 'problem'.


        let globalStatus: "in_progress" | "completed" | "problem" = "in_progress";
        const hasShipments = (order.shipments?.length ?? 0) > 0;
        const allDelivered = hasShipments && order.shipments!.every(s => s.status === 'delivered');
        const anyProblem = order.shipments?.some(s => s.status === 'failed' || s.status === 'cancelled') ?? false;

        if (allDelivered) globalStatus = "completed";
        if (anyProblem) globalStatus = "problem";

        const statusMap = {
            in_progress: { text: dict.status_in_progress, color: "blue" as const, icon: Truck, description: "Kuller on teel" },
            completed: { text: dict.status_completed, color: "green" as const, icon: CheckCircle2, description: "Kõik kaubad kohal" },
            problem: { text: dict.status_problem, color: "red" as const, icon: AlertCircle, description: dict.reason_high_demand },
        };

        // 2. ETA Logic
        // Find latest ETA from shipments
        const etas = order.shipments?.map(s => s.eta_minutes ? new Date(new Date(s.created_at).getTime() + s.eta_minutes * 60000) : null).filter(Boolean) || [];
        const latestEta = etas.length > 0 ? new Date(Math.max(...etas.map(d => d!.getTime()))) : null;

        let etaDisplay = undefined;
        if (latestEta) {
            const isToday = latestEta.toDateString() === new Date().toDateString();
            const timeStr = latestEta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            etaDisplay = {
                label: dict.eta_title,
                value: `${isToday ? dict.eta_today : dict.eta_tomorrow}, ${timeStr}`,
                isDelayed: globalStatus === 'problem'
            };
        }

        // 3. Timeline Logic
        // Mock progress based on status
        const steps = [
            { id: 'placed', label: dict.timeline_placed, icon: FileText, completed: true },
            { id: 'confirmed', label: dict.timeline_confirmed, icon: CheckCircle2, completed: order.status !== 'draft' },
            { id: 'assembly', label: dict.timeline_assembly, icon: Package, completed: order.status !== 'draft' && order.status !== 'submitted' },
            { id: 'shipping', label: dict.timeline_shipping, icon: Truck, completed: order.shipments?.some(s => ['dispatched', 'delivered'].includes(s.status)) ?? false },
            { id: 'delivered', label: dict.timeline_delivered, icon: Star, completed: allDelivered }
        ];

        // Mark current
        let foundCurrent = false;
        const timeline = steps.map(s => {
            const isCurrent = !s.completed && !foundCurrent;
            if (isCurrent) foundCurrent = true;
            return { ...s, current: isCurrent || (s.id === 'delivered' && s.completed) };
        });

        // 4. Grouping Items (Partial Delivery Support)
        // Group by shipment type or date. For now, group by "Shipment X" if multiple, or just "Items"
        const groups = [];
        if (order.shipments && order.shipments.length > 0) {
            order.shipments.forEach((s, idx) => {
                // Enrich events with reason texts
                if (s.events) {
                    s.events = s.events.map(ev => {
                        // Filter internal events (though RLS should handle, good to be safe)
                        if (ev.visibility === 'internal') return null;

                        // Generate message if missing
                        let msg = ev.message;
                        if (ev.reason_code && dictReasons[ev.reason_code]) {
                            msg = dictReasons[ev.reason_code].title;
                        } else if (!msg) {
                            msg = (dictAcc[`timeline_${ev.event_status}`] || ev.event_status);
                        }
                        return { ...ev, message: msg };
                    }).filter(Boolean) as any;
                }

                groups.push({
                    title: (dictAcc[`type_${s.type}`] || s.type) + ` • ${(dictAcc[`shipment_${s.status}`] || s.status)}`,
                    items: order.items?.filter(i => i.shipment_id === s.id) || [],
                    shipment: s
                });
            });
        } else {
            groups.push({
                title: dict.tab_today, // Fallback
                items: order.items || []
            });
        }

        return {
            id: order.id,
            displayId: order.id.slice(0, 8),
            humanStatus: statusMap[globalStatus],
            uxState,
            eta: etaDisplay,
            timeline,
            groups,
            delivery: {
                address: `${order.address_line}, ${order.city}`,
                contact: order.phone,
                method: order.shipments?.[0]?.type === 'pickup' ? dictAcc.type_pickup : dictAcc.type_wolt // Simplified
            }
        };

    }, [order, t]);

    if (loading) return <div></div>; // Handled by loading.tsx? No, client side needs spinner
    if (!order || !model) return <div className="p-8 text-center text-slate-500">Order not found</div>;

    const StatusIcon = model.humanStatus.icon;

    return (
        <div className="max-w-3xl mx-auto pb-20">
            {/* Nav */}
            <Link href="/account/orders" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 font-medium text-sm transition-colors">
                <ArrowLeft size={16} />
                {(t as any).account.back_to_orders}
            </Link>

            {/* 1. Header Card */}
            <div className={`
                relative overflow-hidden rounded-3xl p-6 mb-8 text-white shadow-lg transition-transform hover:scale-[1.01] duration-300
                ${model.humanStatus.color === 'blue' ? 'bg-gradient-to-br from-blue-600 to-indigo-700' : ''}
                ${model.humanStatus.color === 'green' ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' : ''}
                ${model.humanStatus.color === 'red' ? 'bg-gradient-to-br from-rose-500 to-red-700' : ''}
            `}>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono tracking-wider border border-white/20">
                            #{model.displayId}
                        </div>
                        {model.eta && (
                            <div className="text-right">
                                <div className="text-blue-100 text-xs font-medium uppercase tracking-wider mb-1 opacity-80">{model.eta.label}</div>
                                <div className="text-2xl font-bold tracking-tight">{model.eta.value}</div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/10 shadow-inner">
                            <StatusIcon size={32} className="text-white" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                                {model.humanStatus.text}
                            </h1>
                            <p className="text-blue-100 text-lg opacity-90 font-medium">
                                {model.humanStatus.description}
                            </p>
                        </div>
                    </div>

                    {model.uxState.showCard && model.uxState.reasonCode && (
                        <div className={`mt-6 backdrop-blur-md rounded-2xl p-4 border flex gap-4 items-start
                            ${model.uxState.severity === DeliverySeverity.INFO ? 'bg-blue-500/10 border-blue-400/20 text-blue-50' : ''}
                            ${model.uxState.severity === DeliverySeverity.WARNING ? 'bg-amber-500/10 border-amber-400/20 text-amber-50' : ''}
                            ${model.uxState.severity === DeliverySeverity.ACTION_REQUIRED ? 'bg-rose-500/20 border-rose-400/30 text-rose-50' : ''}
                            ${model.uxState.severity === DeliverySeverity.ERROR ? 'bg-red-900/40 border-red-500/30 text-red-50' : ''}
                        `}>
                            {model.uxState.severity === DeliverySeverity.INFO && <Info className="shrink-0 mt-0.5 text-blue-200" />}
                            {(model.uxState.severity === DeliverySeverity.WARNING || model.uxState.severity === DeliverySeverity.ACTION_REQUIRED) && <AlertTriangle className="shrink-0 mt-0.5 text-amber-200" />}
                            {model.uxState.severity === DeliverySeverity.ERROR && <XCircle className="shrink-0 mt-0.5 text-red-300" />}

                            <div className="flex-1">
                                <div className="font-bold text-lg mb-1">
                                    {(t as any).delivery.ux[model.uxState.reasonCode].title}
                                </div>
                                <div className="text-white/80 text-sm mb-3">
                                    {(t as any).delivery.ux[model.uxState.reasonCode].description}
                                </div>

                                {model.uxState.action !== DeliveryAction.NONE && (
                                    <button className="bg-white text-slate-900 font-bold py-2 px-4 rounded-xl text-sm hover:bg-slate-100 transition-colors">
                                        {(t as any).delivery.ux.cta[model.uxState.action]}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Decorative BG */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl"></div>
            </div>


            {/* 2. Visual Timeline */}
            <div className="mb-10 px-2 lg:px-0">
                <div className="flex justify-between items-center relative">
                    {/* Connection Line */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-10 rounded-full"></div>
                    <div className="absolute top-1/2 left-0 h-1 bg-emerald-500/20 -z-10 rounded-full transition-all duration-1000"
                        style={{ width: `${(model.timeline.filter(s => s.completed).length / (model.timeline.length - 1)) * 100}%` }}
                    ></div>

                    {model.timeline.map((step, idx) => {
                        const Icon = step.icon;
                        const isCompleted = step.completed;
                        const isCurrent = step.current;

                        return (
                            <div key={idx} className="flex flex-col items-center gap-3">
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center border-4 z-10 transition-all duration-500
                                    ${isCompleted ? 'bg-emerald-500 border-white text-white shadow-lg shadow-emerald-500/30 scale-110' :
                                        isCurrent ? 'bg-white border-blue-500 text-blue-500 ring-4 ring-blue-500/20' :
                                            'bg-slate-50 border-slate-200 text-slate-300'}
                                `}>
                                    <Icon size={isCompleted ? 18 : 16} strokeWidth={isCompleted ? 3 : 2} />
                                </div>
                                <span className={`
                                    text-xs font-semibold uppercase tracking-wider text-center max-w-[80px] transition-colors
                                    ${isCompleted ? 'text-emerald-700' : isCurrent ? 'text-blue-700' : 'text-slate-400'}
                                `}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 3. Order Content (Groups) */}
            <div className="space-y-6 mb-10">
                <h3 className="text-xl font-bold text-slate-900 px-2">{(t as any).order_details.items_count.replace('{count}', order.items?.reduce((acc, i: any) => acc + i.qty, 0) || 0)}</h3>

                {model.groups.map((group, idx) => (
                    <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-slate-50/50 px-6 py-3 border-b border-slate-100 flex justify-between items-center">
                            <span className="font-semibold text-slate-700 text-sm flex items-center gap-2">
                                <Package size={16} className="text-slate-400" />
                                {group.title}
                            </span>
                            {group.shipment?.eta_minutes && (
                                <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                                    ~{group.shipment.eta_minutes} min
                                </span>
                            )}
                        </div>
                        <div className="divide-y divide-slate-100">
                            {group.items.map((item) => (
                                <div key={item.id} className="p-4 flex gap-4 items-center hover:bg-slate-50/50 transition-colors">
                                    <div className="w-16 h-16 bg-slate-100 rounded-lg shrink-0 flex items-center justify-center">
                                        {/* Image Placeholder */}
                                        <Package className="text-slate-300" size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-slate-900 truncate">{item.name}</div>
                                        <div className="text-sm text-slate-500">{item.qty} {(t as any).common.pcs} × {item.price.toFixed(2)} €</div>
                                    </div>
                                    <div className="text-right font-bold text-slate-900">
                                        {item.line_total.toFixed(2)} €
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* 4. Delivery & Meta Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wide text-slate-500">
                        <MapPin size={16} />
                        {(t as any).order_details.shipping_address}
                    </h4>
                    <div className="text-lg font-medium text-slate-900">{model.delivery.address}</div>
                    <div className="bg-slate-50 p-3 rounded-xl flex items-center gap-3 text-sm text-slate-600">
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-500">
                            {model.delivery.contact.slice((model.delivery.contact.length || 2) - 2)}
                        </div>
                        <div>
                            <div className="font-bold text-slate-900">{(t as any).order_details.contact_receiver}</div>
                            {model.delivery.contact}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wide text-slate-500">
                        <Info size={16} />
                        {(t as any).order_details.shipping_method}
                    </h4>
                    <div className="text-lg font-medium text-slate-900 flex items-center gap-2">
                        {model.delivery.method}
                        <CheckCircle2 size={16} className="text-emerald-500" />
                    </div>

                    {/* Summary Mini */}
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center mt-2">
                        <span className="text-slate-500">Total</span>
                        <span className="text-xl font-black text-slate-900">{order.total.toFixed(2)} €</span>
                    </div>
                </div>
            </div>

            {/* 5. Help & Actions */}
            <div className="space-y-4">
                {/* Help Block */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                    <div className="bg-white p-4 rounded-full shadow-sm text-indigo-500 shrink-0">
                        <HelpCircle size={24} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-indigo-900 text-lg mb-1">{(t as any).order_details.help_title}</h4>
                        <p className="text-indigo-700/80 text-sm">{(t as any).order_details.help_desc}</p>
                    </div>
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                        <button className="bg-white hover:bg-indigo-100 text-indigo-600 font-semibold py-2 px-4 rounded-xl border border-indigo-200 transition-colors text-sm">
                            {(t as any).order_details.action_faq}
                        </button>
                    </div>
                </div>

                {/* Primary Actions */}
                <div className="grid grid-cols-2 gap-4">
                    <button className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-600 font-bold py-4 rounded-xl border border-slate-200 transition-colors shadow-sm">
                        <Repeat size={18} />
                        {(t as any).order_details.action_repeat}
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-slate-900/10">
                        <Star size={18} />
                        {(t as any).order_details.action_rate}
                    </button>
                </div>
            </div>
        </div>
    );
}
