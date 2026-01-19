"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, Check, ChevronRight } from "lucide-react";
import { supabase } from "@/app/lib/supabaseClient";
import type { Notification } from "@/app/lib/types";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotificationBell() {
    const { t } = useLanguage();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

        if (data) {
            setNotifications(data as any);
            setUnreadCount(data.filter((n: any) => !n.is_read).length);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        fetchNotifications();

        // Optional: Realtime subscription could go here
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const handleRead = async (n: Notification) => {
        if (!n.is_read) {
            await supabase.from('notifications').update({ is_read: true }).eq('id', n.id);
            // Optimistic update
            setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, is_read: true } : item));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
        setIsOpen(false);
        if (n.payload?.order_id) {
            router.push(`/account/orders/${n.payload.order_id}`);
        }
    };

    const getLocalizedText = (n: Notification) => {
        const dict = (t as any).notifications || {};
        const title = n.title_key ? titleFallback(n.title_key, dict) : n.title_text || "";
        const body = n.body_key ? bodyFallback(n.body_key, dict, n.payload) : n.body_text || "";
        return { title, body };
    };

    // Helper to resolve nested keys "notifications.title.dispatched"
    const titleFallback = (key: string, dict: any) => {
        const parts = key.split('.');
        if (parts.length === 3 && parts[0] === 'notifications') {
            return dict[parts[1]]?.[parts[2]] || key;
        }
        return key;
    };

    const bodyFallback = (key: string, dict: any, payload: any) => {
        let text = titleFallback(key, dict); // Reuse logic
        // Simple template replacement
        if (payload) {
            // e.g. {eta_range}
            // payload might trigger other lookups, simplifed for now
            Object.keys(payload).forEach(k => {
                text = text.replace(`{${k}}`, payload[k]);
            });
        }
        return text;
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                        <div className="p-3 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <span className="font-bold text-sm text-slate-700">Notifications</span>
                            <Link href="/account/notifications" className="text-xs text-blue-600 font-medium hover:underline">
                                View All
                            </Link>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm">
                                    {(t as any).notifications?.empty || "No notifications"}
                                </div>
                            ) : (
                                notifications.map(n => {
                                    const { title, body } = getLocalizedText(n);
                                    return (
                                        <div
                                            key={n.id}
                                            onClick={() => handleRead(n)}
                                            className={`p-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer flex gap-3 ${!n.is_read ? 'bg-blue-50/30' : ''}`}
                                        >
                                            <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.is_read ? 'bg-blue-500' : 'bg-slate-200'}`}></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-semibold text-slate-800 truncate">{title}</div>
                                                <div className="text-xs text-slate-500 line-clamp-2 mt-0.5">{body}</div>
                                                <div className="text-[10px] text-slate-400 mt-1">
                                                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
