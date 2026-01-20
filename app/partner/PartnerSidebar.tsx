"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, Upload, Truck, Settings, LogOut, Store as StoreIcon, ShoppingCart } from "lucide-react";
import { createBrowserClient } from "@/app/lib/supabase/client";

export default function PartnerSidebar({ storeName }: { storeName: string }) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createBrowserClient();

    // Check if we are on a "public" partner page that shouldn't show sidebar? 
    // The Layout splits logic, so if we are here, we are likely authenticated. 
    // But if original layout handled `welcome` etc inside it, we might need to handle it.
    // Assuming for MVP we prioritize the Dashboard structure. 
    // If the user visits /partner/welcome, layout might have rendered this. 
    // Standard approach: Public pages should have different layout group (route groups).
    // For now, if pathname starts with /partner/welcome, return null?
    // User instructions said "Unify routes". 
    // I'll assume standard layout for now.

    const navItems = [
        { href: "/partner/dashboard", label: "Töölaud", icon: LayoutDashboard },
        { href: "/partner/products", label: "Tooted", icon: Package },
        { href: "/partner/orders", label: "Tellimused", icon: ShoppingCart },
        { href: "/partner/import", label: "Import", icon: Upload },
        { href: "/partner/settings", label: "Seaded", icon: Settings },
    ];

    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 h-screen sticky top-0">
            <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-900 font-bold shrink-0">SB</div>
                <span className="font-bold text-white tracking-tight">Partner</span>
            </div>

            <div className="p-4 border-b border-slate-800">
                <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                    <StoreIcon size={20} className="text-emerald-500" />
                    <div className="overflow-hidden">
                        <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Kauplus</div>
                        <div className="text-sm font-bold text-white truncate" title={storeName}>{storeName}</div>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(item.href)
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "hover:bg-slate-800 hover:text-white"
                            }`}
                    >
                        <item.icon size={18} />
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 w-full text-left transition-colors"
                >
                    <LogOut size={18} />
                    Logi välja
                </button>
            </div>
        </aside>
    );
}
