"use client";

import Link from "next/link";
import NavbarCartLink from "./NavbarCartLink";
import HeaderAuth from "./HeaderAuth";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function Header() {
    const { t } = useLanguage();

    return (
        <header className="sticky top-0 z-50 bg-[#0f172a] text-white shadow-md border-b border-slate-700">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Brand Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-orange-500 rounded p-1">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white group-hover:text-slate-200 transition-colors">
                        SmartBuild
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex gap-8 items-center">
                    <Link href="/products" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                        {(t as any).footer?.catalog ?? "Kataloog"}
                    </Link>
                    <NavbarCartLink />
                    <div className="h-5 w-px bg-slate-700"></div>
                    <HeaderAuth />
                </nav>

                {/* Mobile Menu Icon (Placeholder) */}
                <div className="md:hidden flex items-center gap-4">
                    <LanguageSwitcher />
                    <button className="text-slate-300 hover:text-white">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
}
