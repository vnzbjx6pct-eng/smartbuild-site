"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useUser } from "@/components/auth/UserProvider";
import { useState } from "react";
import SocialLoginModal from "@/components/auth/SocialLoginModal";

export default function BottomNav() {
    const pathname = usePathname();
    const { totalItems } = useCart();
    const { t } = useLanguage();
    const { user } = useUser();
    const [showLogin, setShowLogin] = useState(false);

    const isActive = (path: string) => pathname === path;

    const handleProfileClick = (e: React.MouseEvent) => {
        if (!user) {
            e.preventDefault();
            setShowLogin(true);
        }
    };

    return (
        <>
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 px-6 py-3 safe-area-bottom">
                <div className="flex justify-between items-center max-w-sm mx-auto">

                    {/* Catalog */}
                    <Link href="/products" className={`flex flex-col items-center gap-1 ${isActive('/products') ? 'text-slate-900' : 'text-slate-400'}`}>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        <span className="text-[10px] font-medium">{(t as any).footer?.catalog ?? "Kataloog"}</span>
                    </Link>

                    {/* Cart */}
                    <Link href="/cart" className={`flex flex-col items-center gap-1 relative ${isActive('/cart') ? 'text-slate-900' : 'text-slate-400'}`}>
                        <div className="relative">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            {totalItems > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white ring-2 ring-white">
                                    {totalItems}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-medium">{t.common.cart}</span>
                    </Link>

                    {/* Profile/Login */}
                    <Link
                        href={user ? "/partner/dashboard" : "#"}
                        onClick={handleProfileClick}
                        className={`flex flex-col items-center gap-1 ${isActive('/login') ? 'text-slate-900' : 'text-slate-400'}`}
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-[10px] font-medium">
                            {user ? user.name?.split(' ')[0] : t.common.login}
                        </span>
                    </Link>

                </div>
            </div>

            <SocialLoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
        </>
    );
}
