"use client";

import { CartProvider } from "@/app/components/cart/CartProvider";
import { ToastProvider } from "@/components/ui/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ToastProvider>
            <CartProvider>
                {children}
            </CartProvider>
        </ToastProvider>
    );
}
