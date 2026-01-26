"use client";

import { useCart } from "./CartProvider";
import { X, ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { getProductImage } from "@/app/lib/imageUtils";

export default function CartSidebar() {
    const { cart, isSidebarOpen, toggleSidebar, removeFromCart, updateQuantity } = useCart();
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isSidebarOpen) {
                toggleSidebar();
            }
        };

        if (isSidebarOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.body.style.overflow = "hidden"; // Prevent scrolling
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.body.style.overflow = "unset";
        };
    }, [isSidebarOpen, toggleSidebar]);

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                aria-hidden="true"
            />

            {/* SidebarPanel */}
            <div
                ref={sidebarRef}
                className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900">
                    <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                        <ShoppingBag size={20} className="text-slate-300" />
                        Ostukorv {cart && cart.itemsCount > 0 && <span className="text-slate-400 font-normal">({cart.itemsCount})</span>}
                    </h2>
                    <button
                        onClick={toggleSidebar}
                        className="p-2 hover:bg-slate-800/70 rounded-full text-slate-400 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {!cart || cart.items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                            <ShoppingBag size={48} className="mb-3 text-slate-600/70" />
                            <p>Ostukorv on tühi.</p>
                            <button
                                onClick={toggleSidebar}
                                className="mt-4 text-emerald-400 font-medium hover:text-emerald-300 transition-colors"
                            >
                                Sirvi tooteid
                            </button>
                        </div>
                    ) : (
                        cart.items.map((item) => (
                            <div key={item.id} className="flex gap-4 p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                                <div className="w-20 h-20 bg-slate-800/80 rounded-lg border border-slate-700/70 shrink-0 overflow-hidden flex items-center justify-center">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={getProductImage(item.product)}
                                        alt={item.product.name}
                                        className="w-full h-full object-contain p-2"
                                    />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-medium text-slate-100 text-sm line-clamp-2 leading-snug mb-1">
                                            {item.product.name}
                                        </h4>
                                        <p className="text-xs text-slate-400 text-sm">
                                            {Number(item.product.price).toFixed(2)} € / {item.product.unit}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-3 bg-slate-800/80 rounded-lg border border-slate-700/70 px-2 py-1">
                                            <button
                                                onClick={() => updateQuantity(item.offer_id, item.quantity - 1)}
                                                className="text-slate-400 hover:text-slate-200 disabled:opacity-30 transition-colors"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="text-sm font-medium w-4 text-center text-slate-100">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.offer_id, item.quantity + 1)}
                                                className="text-slate-400 hover:text-slate-200 transition-colors"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.offer_id)}
                                            className="text-rose-400 hover:text-rose-300 p-1.5 hover:bg-rose-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {cart && cart.items.length > 0 && (
                    <div className="border-t border-slate-800/80 p-4 bg-slate-900 shadow-[0_-6px_12px_-6px_rgba(0,0,0,0.6)]">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-slate-400 font-medium">Kokku</span>
                            <span className="text-2xl font-bold text-slate-100">{cart.total.toFixed(2)} €</span>
                        </div>
                        <div className="space-y-3">
                            <Link
                                href="/checkout"
                                onClick={toggleSidebar}
                                className="block w-full py-3.5 bg-emerald-500 text-slate-950 font-bold text-center rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40"
                            >
                                Vormista tellimus
                            </Link>
                            <Link
                                href="/cart"
                                onClick={toggleSidebar}
                                className="block w-full py-3.5 border border-slate-700/70 text-slate-200 font-bold text-center rounded-xl hover:bg-slate-800/70 transition-colors"
                            >
                                Vaata ostukorvi
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
