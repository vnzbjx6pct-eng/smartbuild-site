"use client";

import { useCart } from "./CartProvider";
import { ShoppingCart } from "lucide-react";

export default function CartButton() {
    const { cart, toggleSidebar } = useCart();

    return (
        <button
            onClick={toggleSidebar}
            className="relative p-2 text-slate-600 hover:text-emerald-600 transition-colors rounded-full hover:bg-slate-100"
            aria-label="Ostukorv"
        >
            <ShoppingCart size={24} />
            {cart && cart.itemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {cart.itemsCount > 99 ? '99+' : cart.itemsCount}
                </span>
            )}
        </button>
    );
}
