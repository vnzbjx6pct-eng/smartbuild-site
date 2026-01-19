"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import type { Notification } from "@/app/lib/types";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import Link from "next/link";
import { ArrowLeft, Clock, AlertTriangle, Info, AlertCircle } from "lucide-react";

// Derived state must be computed with useMemo; do not setState in useEffect for filtering
export default function NotificationsPage() {
    const { t } = useLanguage();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');

    const fetchNotifications = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setNotifications([]);
            setLoading(false);
            return;
        }

        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(100);

        if (data) {
            setNotifications(data as unknown as Notification[]);
        }
        setLoading(false);
    };

    useEffect(() => {

        setTimeout(() => fetchNotifications(), 0);
    }, []);

    const filteredNotifications = useMemo(() => {
        return notifications.filter(n => {
            if (filter === 'unread') return !n.is_read;
            if (filter === 'important') return ['action_required', 'error', 'warning'].includes(n.severity);
            return true;
        });
    }, [notifications, filter]);

    const markAllRead = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);

        // Background sync
        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(100);

        if (data) setNotifications(data as unknown as Notification[]);
    };

    const getLocalizedText = (n: Notification) => {
        const dict = (t as any).notifications || {};
        const title = n.title_key ? titleFallback(n.title_key, dict) : n.title_text || "";
        const body = n.body_key ? bodyFallback(n.body_key, dict, n.payload) : n.body_text || "";
        return { title, body };
    };

    const titleFallback = (key: string, dict: any) => {
        const parts = key.split('.');
        if (parts.length === 3 && parts[0] === 'notifications') {
            return dict[parts[1]]?.[parts[2]] || key;
        }
        return key;
    };

    const bodyFallback = (key: string, dict: any, payload: any) => {
        let text = titleFallback(key, dict);
        if (payload && typeof payload === 'object') {
            Object.keys(payload).forEach(k => {
                text = text.replace(`{${k}}`, payload[k]);
            });
        }
        return text;
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <div className="max-w-md mx-auto bg-white min-h-screen shadow-sm">
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
                    <div className="flex items-center gap-3">
                        <Link href="/account" className="p-2 -ml-2 hover:bg-slate-50 rounded-full">
                            <ArrowLeft className="text-slate-600" size={24} />
                        </Link>
                        <h1 className="text-xl font-bold text-slate-900">Notifications</h1>
                    </div>
                    <button onClick={markAllRead} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                        {(t as any).notifications?.mark_all_read || "Mark all read"}
                    </button>
                </div>

                {/* Filters */}
                <div className="p-4 flex gap-2 overflow-x-auto no-scrollbar">
                    {(['all', 'unread', 'important'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                                ${filter === f
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="px-4 space-y-3">
                    {loading ? (
                        <div className="py-10 text-center text-slate-400">Loading...</div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="py-20 text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <Info size={32} />
                            </div>
                            <p className="text-slate-500">{(t as any).notifications?.empty || "No notifications"}</p>
                        </div>
                    ) : (
                        filteredNotifications.map(n => {
                            const { title, body } = getLocalizedText(n);

                            return (
                                <Link
                                    key={n.id}
                                    href={n.payload?.order_id ? `/account/orders/${n.payload.order_id}` : '#'}
                                    className={`block p-4 rounded-2xl border transition-all
                                        ${!n.is_read ? 'bg-white border-blue-200 shadow-sm' : 'bg-slate-50/50 border-transparent'}
                                    `}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-1 shrink-0
                                            ${n.severity === 'action_required' ? 'text-amber-500' : ''}
                                            ${n.severity === 'error' ? 'text-red-500' : ''}
                                            ${n.severity === 'warning' ? 'text-amber-500' : ''}
                                            ${n.severity === 'info' ? 'text-blue-500' : ''}
                                        `}>
                                            {(n.severity === 'action_required' || n.severity === 'warning') && <AlertTriangle size={20} />}
                                            {n.severity === 'error' && <AlertCircle size={20} />}
                                            {n.severity === 'info' && <Info size={20} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2 mb-1">
                                                <h3 className={`font-semibold text-base ${!n.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                                                    {title}
                                                </h3>
                                                {!n.is_read && (
                                                    <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                                                )}
                                            </div>
                                            <p className="text-slate-600 text-sm leading-relaxed mb-2">{body}</p>
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <Clock size={12} />
                                                {new Date(n.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
