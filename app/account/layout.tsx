"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient"; // Direct
import { LayoutDashboard, ShoppingBag, Settings, LogOut, User } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const { t } = useLanguage();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login"); // Guard
                return;
            }
            setUserEmail(user.email || "");
            setLoading(false);
        };
        checkAuth();
    }, [router]);

    if (loading) return <div className="min-h-screen pt-20 flex justify-center text-slate-400">...</div>;

    const navItems = [
        { href: "/account", label: t.account.nav_overview || "Ülevaade", icon: LayoutDashboard },
        { href: "/account/orders", label: t.account.nav_orders || "Tellimused", icon: ShoppingBag },
        { href: "/account/settings", label: t.account.nav_settings || "Seaded", icon: Settings },
    ];

    const isActive = (path: string) => pathname === path;

    return (
        <div className="min-h-screen bg-slate-50 pt-20 pb-12">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* SIDEBAR */}
                    <aside className="w-full md:w-64 shrink-0 space-y-6">
                        {/* Profile Card */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                <User size={20} />
                            </div>
                            <div className="overflow-hidden">
                                <div className="text-xs font-bold text-slate-400 uppercase">Konto</div>
                                <div className="text-sm font-bold text-slate-900 truncate" title={userEmail || ""}>{userEmail}</div>
                            </div>
                        </div>

                        {/* Nav */}
                        <nav className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            {navItems.map(item => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-b last:border-0 border-slate-50 ${isActive(item.href)
                                        ? "bg-emerald-50 text-emerald-600 border-l-4 border-l-emerald-500"
                                        : "text-slate-600 hover:bg-slate-50 border-l-4 border-l-transparent"
                                        }`}
                                >
                                    <item.icon size={18} />
                                    {item.label}
                                </Link>
                            ))}
                            <button
                                onClick={async () => {
                                    await supabase.auth.signOut();
                                    router.push("/");
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors border-l-4 border-l-transparent text-left"
                            >
                                <LogOut size={18} />
                                {t.account.nav_logout || "Logi välja"}
                            </button>
                        </nav>
                    </aside>

                    {/* CONTENT */}
                    <main className="flex-1">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
