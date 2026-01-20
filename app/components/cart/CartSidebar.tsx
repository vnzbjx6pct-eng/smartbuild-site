"use client";

import { useCart } from "./CartProvider";
import { X, ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

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
                className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <ShoppingBag size={20} />
                        Ostukorv {cart && cart.itemsCount > 0 && <span className="text-slate-500 font-normal">({cart.itemsCount})</span>}
                    </h2>
                    <button
                        onClick={toggleSidebar}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {!cart || cart.items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                            <ShoppingBag size={48} className="mb-3 opacity-20" />
                            <p>Ostukorv on tühi.</p>
                            <button
                                onClick={toggleSidebar}
                                className="mt-4 text-emerald-600 font-medium hover:underline"
                            >
                                Sirvi tooteid
                            </button>
                        </div>
                    ) : (
                        cart.items.map((item) => (
                            <div key={item.id} className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="w-20 h-20 bg-white rounded-lg border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                                    {item.product.image_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <ShoppingBag size={24} className="text-slate-300" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-medium text-slate-900 text-sm line-clamp-2 leading-snug mb-1">
                                            {item.product.name}
                                        </h4>
                                        <p className="text-xs text-slate-500 text-sm">
                                            {Number(item.product.price).toFixed(2)} € / {item.product.unit}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-3 bg-white rounded-lg border border-slate-200 px-2 py-1">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="text-slate-400 hover:text-slate-600"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
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
                    <div className="border-t border-slate-100 p-4 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-slate-500 font-medium">Kokku</span>
                            <span className="text-2xl font-bold text-slate-900">{cart.total.toFixed(2)} €</span>
                        </div>
                        <div className="space-y-3">
                            <Link
                                href="/checkout"
                                onClick={toggleSidebar}
                                className="block w-full py-3.5 bg-emerald-600 text-white font-bold text-center rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                            >
                                Vormista tellimus
                            </Link>
                            <Link
                                href="/cart"
                                onClick={toggleSidebar}
                                className="block w-full py-3.5 border border-slate-200 text-slate-700 font-bold text-center rounded-xl hover:bg-slate-50 transition-colors"
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
