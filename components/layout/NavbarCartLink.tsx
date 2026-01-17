"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function NavbarCartLink() {
    const { totalItems } = useCart();
    const { t } = useLanguage();

    return (
        <Link href="/cart" className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-2 group">
            <span>{t.common.cart}</span>
            <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full group-hover:bg-orange-600 transition-colors">
                {totalItems}
            </span>
        </Link>
    );
}
