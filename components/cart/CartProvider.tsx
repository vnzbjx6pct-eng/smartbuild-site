"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type CartItem = {
    id: string;
    name: string;
    category?: string;
    unit?: string;
    image?: string;
    qty: number;
    // We keep offers here to calculate totals roughly
    offers?: { store: string; price: number; currency: string }[];
};

type CartContextType = {
    items: CartItem[];
    addItem: (product: any, qty?: number) => void;
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

    const addItem = (product: any, qty = 1) => {
        setItems((prev) => {
            const existing = prev.find((p) => p.id === product.id);
            if (existing) {
                return prev.map((p) =>
                    p.id === product.id ? { ...p, qty: p.qty + qty } : p
                );
            }
            // Create new item
            return [
                ...prev,
                {
                    id: product.id,
                    name: product.name,
                    category: product.category,
                    unit: product.unit || product.unitLabel,
                    image: product.image,
                    offers: product.offers?.map((o: any) => ({
                        store: o.storeName,
                        price: o.price,
                        currency: o.currency,
                    })),
                    qty,
                },
            ];
        });
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
            value={{ items, addItem, inc, dec, remove, clear, totalItems }}
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
