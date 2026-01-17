"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import { LayoutDashboard, Package, Upload, Truck, Settings, LogOut, Store as StoreIcon } from "lucide-react";

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [storeName, setStoreName] = useState<string | null>(null);
    const [authorized, setAuthorized] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    // const supabase = createClient(); // Removed

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }

            // Check store access
            // We use a direct query to store_users for now.
            // Ensure RLS allows reading own store_users.
            const { data: memberships, error } = await supabase
                .from("store_users")
                .select("store_id, role, stores(name)")
                .eq("user_id", user.id)
                .single();

            if (error || !memberships) {
                console.error("Access denied or no store linked", error);
                // Allow access to welcome/join pages even if no store (public routes handled by middleware usually, but here manual)
                // Actually, if we are in /partner layout, we assume authorized context.
                // If the user is just browsing /partner/welcome, they shouldn't hit this layout check if they are anon?
                // Wait, /partner/welcome is INSIDE /partner, so it inherits this layout.
                // WE NEED TO EXCLUDE /partner/welcome FROM THIS AUTH CHECK.
                if (pathname.startsWith("/partner/welcome") || pathname.startsWith("/partner/join") || pathname.startsWith("/partner/plans")) {
                    setAuthorized(true);
                    setLoading(false);
                    return;
                }

                // If strictly /partner root or dashboard pages
                alert("Teil puudub ligipääs partneri töölauale. Palun võtke ühendust klienditoega.");
                router.push("/partner/welcome");
                return;
            }

            // @ts-ignore - Supabase types might imply array, but single() returns object
            setStoreName(memberships.stores?.name || "Minu Pood");
            setAuthorized(true);
            setLoading(false);
        };

        checkAuth();
    }, [router, pathname]);

    // Public pages (Welcome, Join, Plans) share the main layout or have their own? 
    // If they are under /partner, they get this sidebar. 
    // The previous /partner/page.tsx (now welcome) was full width.
    // OPTION: Move welcome/join OUT of this layout or conditionally render sidebar.
    // Better: Conditionally render sidebar only for authenticated dashboard routes.

    const isPublic = pathname.startsWith("/partner/welcome") || pathname.startsWith("/partner/join") || pathname.startsWith("/partner/plans");

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">Laen...</div>;

    if (isPublic) {
        return <>{children}</>;
    }

    if (!authorized) return null;

    const navItems = [
        { href: "/partner", label: "Ülevaade", icon: LayoutDashboard },
        { href: "/partner/products", label: "Tooted", icon: Package },
        { href: "/partner/import", label: "Import", icon: Upload },
        { href: "/partner/delivery", label: "Tarne", icon: Truck },
        { href: "/partner/profile", label: "Profiil", icon: Settings },
    ];

    const isActive = (path: string) => pathname === path;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* SIDEBAR */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
                <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-900 font-bold shrink-0">SB</div>
                    <span className="font-bold text-white tracking-tight">Partner</span>
                </div>

                <div className="p-4 border-b border-slate-800">
                    <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                        <StoreIcon size={20} className="text-emerald-500" />
                        <div className="overflow-hidden">
                            <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Kauplus</div>
                            <div className="text-sm font-bold text-white truncate" title={storeName || ""}>{storeName}</div>
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
                        onClick={async () => {
                            await supabase.auth.signOut();
                            router.push("/login");
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 w-full text-left transition-colors"
                    >
                        <LogOut size={18} />
                        Logi välja
                    </button>
                </div>
            </aside>

            {/* CONTENT AREA */}
            <main className="flex-1 overflow-auto">
                <div className="container mx-auto px-8 py-8 max-w-6xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
