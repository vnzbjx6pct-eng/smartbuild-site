"use client";

import { useUser } from "@/components/auth/UserProvider";
import { useState } from "react";
import SocialLoginModal from "@/components/auth/SocialLoginModal";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function HeaderAuth() {
    const { user, logout } = useUser();
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    if (user) {
        return (
            <div className="flex items-center gap-6">
                <LanguageSwitcher />

                <div className="relative">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg transition-all border border-slate-600"
                    >
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white">
                            {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                        </div>
                        <span className="max-w-[100px] truncate">{user.name || user.email.split('@')[0]}</span>
                    </button>

                    {isOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 text-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                                <div className="px-4 py-2 border-b border-slate-50">
                                    <p className="text-xs text-slate-500">Sisse logitud</p>
                                    <p className="text-sm font-bold truncate">{user.email}</p>
                                </div>
                                <button
                                    onClick={logout}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    Logi välja
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-6">
            <LanguageSwitcher />

            <button
                onClick={() => setShowLoginModal(true)}
                className="text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 px-5 py-2.5 rounded-xl transition-all border border-slate-600 shadow-sm hover:shadow-md"
            >
                {t.common.login} / {t.common.register}
            </button>

            <SocialLoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
            />
        </div>
    );
}
