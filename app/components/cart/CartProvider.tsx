"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Cart, CartItem } from '@/app/types';
import { getCart, addToCart as addToCartAction, removeFromCart as removeFromCartAction, updateCartItemQuantity as updateCartItemQuantityAction, clearCart as clearCartAction } from '@/app/actions/cart';
import { toast } from 'react-hot-toast';

interface CartContextType {
    cart: Cart | null;
    isLoading: boolean;
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    addToCart: (offerId: string, quantity?: number, options?: {
        silent?: boolean;
        debug?: {
            bestOfferId?: string | null;
            bestOfferPrice?: number | null;
            bestOfferStock?: number | null;
            offersLength?: number;
            isAvailable?: boolean;
        };
    }) => Promise<{ success: boolean; error?: string }>;
    removeFromCart: (offerId: string) => Promise<void>;
    updateQuantity: (offerId: string, quantity: number) => Promise<void>;
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

    const addToCart = async (
        offerId: string,
        quantity: number = 1,
        options?: {
            silent?: boolean;
            debug?: {
                bestOfferId?: string | null;
                bestOfferPrice?: number | null;
                bestOfferStock?: number | null;
                offersLength?: number;
                isAvailable?: boolean;
            };
        }
    ) => {
        try {
            const result = await addToCartAction(offerId, quantity, options?.debug);
            if (!result.success) {
                if (!options?.silent) {
                    if (result.error === "LOGIN_REQUIRED") {
                        toast.error("Logi sisse, et lisada ostukorvi.");
                    } else {
                        toast.error("Something went wrong.");
                    }
                }
                return result;
            }

            await refreshCart();
            setIsSidebarOpen(true); // Open sidebar on add
            if (!options?.silent) {
                toast.success("Lisatud korvi");
            }
            return result;
        } catch (error) {
            console.error(error);
            if (!options?.silent) {
                toast.error("Something went wrong.");
            }
            return { success: false, error: "ADD_TO_CART_FAILED" };
        }
    };

    const removeFromCart = async (offerId: string) => {
        try {
            // Optimistic update
            if (cart) {
                const updatedItems = cart.items.filter(item => item.offer_id !== offerId);
                setCart({ ...cart, items: updatedItems, total: calculateTotal(updatedItems), itemsCount: calculateCount(updatedItems) });
            }

            const result = await removeFromCartAction(offerId);
            if (!result.success) {
                if (result.error === "LOGIN_REQUIRED") {
                    toast.error("Logi sisse, et muuta ostukorvi.");
                } else {
                    toast.error("Something went wrong.");
                }
                refreshCart();
                return;
            }
            await refreshCart();
            toast.success("Toode eemaldatud.");
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong.");
            refreshCart(); // Revert
        }
    };

    const updateQuantity = async (offerId: string, quantity: number) => {
        try {
            // Optimistic update
            if (cart) {
                const updatedItems = cart.items.map(item =>
                    item.offer_id === offerId ? { ...item, quantity } : item
                );
                setCart({ ...cart, items: updatedItems, total: calculateTotal(updatedItems), itemsCount: calculateCount(updatedItems) });
            }

            const result = await updateCartItemQuantityAction(offerId, quantity);
            if (!result.success) {
                if (result.error === "LOGIN_REQUIRED") {
                    toast.error("Logi sisse, et muuta ostukorvi.");
                } else {
                    toast.error("Something went wrong.");
                }
                refreshCart();
                return;
            }
            await refreshCart();
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong.");
            refreshCart();
        }
    };

    const clearCart = async () => {
        if (confirm("Kas oled kindel, et soovid ostukorvi tühjendada?")) {
            try {
                setCart({ items: [], total: 0, itemsCount: 0 }); // Optimistic
                const result = await clearCartAction();
                if (!result.success) {
                    if (result.error === "LOGIN_REQUIRED") {
                        toast.error("Logi sisse, et muuta ostukorvi.");
                    } else {
                        toast.error("Something went wrong.");
                    }
                    return;
                }
                await refreshCart();
                toast.success("Ostukorv tühjendatud.");
            } catch (error) {
                console.error(error);
                toast.error("Something went wrong.");
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
