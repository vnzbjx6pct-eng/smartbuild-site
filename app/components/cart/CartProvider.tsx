"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useOptimistic } from 'react';
import type { Cart, CartItem } from '@/app/types';
import { getCart, addToCart as addToCartAction, removeFromCart as removeFromCartAction, updateCartItem as updateCartItemAction, clearCart as clearCartAction } from '@/app/actions/cart';
import { toast } from 'react-hot-toast';

interface CartContextType {
    cart: Cart | null;
    isLoading: boolean;
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    addToCart: (productId: string, quantity?: number) => Promise<void>;
    removeFromCart: (itemId: string) => Promise<void>;
    updateQuantity: (itemId: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<Cart | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const refreshCart = useCallback(async () => {
        try {
            const data = await getCart();
            setCart(data);
        } catch (error) {
            console.error("Failed to refresh cart:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshCart();
    }, [refreshCart]);

    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

    const addToCart = async (productId: string, quantity: number = 1) => {
        try {
            await addToCartAction(productId, quantity);
            await refreshCart();
            setIsSidebarOpen(true); // Open sidebar on add
            toast.success("Toode lisatud korvi!");
        } catch (error) {
            console.error(error);
            toast.error("Viga toote lisamisel korvi.");
        }
    };

    const removeFromCart = async (itemId: string) => {
        try {
            // Optimistic update
            if (cart) {
                const updatedItems = cart.items.filter(item => item.id !== itemId);
                setCart({ ...cart, items: updatedItems, total: calculateTotal(updatedItems), itemsCount: calculateCount(updatedItems) });
            }

            await removeFromCartAction(itemId);
            await refreshCart();
            toast.success("Toode eemaldatud.");
        } catch (error) {
            console.error(error);
            toast.error("Viga toote eemaldamisel.");
            refreshCart(); // Revert
        }
    };

    const updateQuantity = async (itemId: string, quantity: number) => {
        try {
            // Optimistic update
            if (cart) {
                const updatedItems = cart.items.map(item =>
                    item.id === itemId ? { ...item, quantity } : item
                );
                setCart({ ...cart, items: updatedItems, total: calculateTotal(updatedItems), itemsCount: calculateCount(updatedItems) });
            }

            await updateCartItemAction(itemId, quantity);
            await refreshCart();
        } catch (error) {
            console.error(error);
            toast.error("Viga koguse muutmisel.");
            refreshCart();
        }
    };

    const clearCart = async () => {
        if (confirm("Kas oled kindel, et soovid ostukorvi tühjendada?")) {
            try {
                setCart({ items: [], total: 0, itemsCount: 0 }); // Optimistic
                await clearCartAction();
                await refreshCart();
                toast.success("Ostukorv tühjendatud.");
            } catch (error) {
                console.error(error);
                toast.error("Viga ostukorvi tühjendamisel.");
            }
        }
    };

    // Helper functions for optimistic UI
    const calculateTotal = (items: CartItem[]) => items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const calculateCount = (items: CartItem[]) => items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cart,
            isLoading,
            isSidebarOpen,
            toggleSidebar,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
