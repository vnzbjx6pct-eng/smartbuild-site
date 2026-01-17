"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import { Product } from "@/app/lib/types";

export type CartItem = Product & {
    qty: number;
    // We keep offers here to calculate totals roughly - already in Product but we can keep overlap if needed
};

type CartContextType = {
    items: CartItem[];
    addItem: (product: Product, qty?: number) => void;
    updateItem: (id: string, qty: number) => void;
    inc: (id: string) => void;
    dec: (id: string) => void;
    remove: (id: string) => void;
    clear: () => void;
    totalItems: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    // Load from local storage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem("sb_cart");
            if (stored) {
                setItems(JSON.parse(stored));
            }
        } catch (e) {
            console.error("Failed to load cart", e);
        }
    }, []);

    // Save to local storage on change
    useEffect(() => {
        try {
            localStorage.setItem("sb_cart", JSON.stringify(items));
        } catch (e) {
            console.error("Failed to save cart", e);
        }
    }, [items]);

    const addItem = (product: Product, qty = 1) => {
        setItems((prev) => {
            const existing = prev.find((p) => p.id === product.id);
            if (existing) {
                return prev.map((p) =>
                    p.id === product.id ? { ...p, qty: p.qty + qty } : p
                );
            }
            // Create new item - spread product to keep all i18n keys
            return [
                ...prev,
                {
                    ...product,
                    // offers: product.offers provided by spread ...product
                    qty,
                },
            ];
        });
    };

    const updateItem = (id: string, qty: number) => {
        setItems((prev) =>
            prev.map((p) => (p.id === id ? { ...p, qty } : p))
        );
    };

    const inc = (id: string) => {
        setItems((prev) =>
            prev.map((p) => (p.id === id ? { ...p, qty: p.qty + 1 } : p))
        );
    };

    const dec = (id: string) => {
        setItems((prev) =>
            prev
                .map((p) => (p.id === id ? { ...p, qty: Math.max(1, p.qty - 1) } : p))
                .filter((p) => p.qty > 0)
        );
    };

    const remove = (id: string) => {
        setItems((prev) => prev.filter((p) => p.id !== id));
    };

    const clear = () => {
        setItems([]);
    };

    const totalItems = items.reduce((acc, curr) => acc + curr.qty, 0);

    return (
        <CartContext.Provider
            value={{ items, addItem, updateItem, inc, dec, remove, clear, totalItems }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}
