"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toast: (message: string, type?: ToastType) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = (message: string, type: ToastType = "info") => {
        const id = generateId();
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            removeToast(id);
        }, 5000);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`
                            flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md transition-all animate-in slide-in-from-right-full
                            ${t.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100' : ''}
                            ${t.type === 'error' ? 'bg-red-950/90 border-red-500/50 text-red-100' : ''}
                            ${t.type === 'info' ? 'bg-slate-900/90 border-slate-700/50 text-slate-100' : ''}
                        `}
                    >
                        {t.type === 'success' && <CheckCircle size={18} className="text-emerald-500" />}
                        {t.type === 'error' && <AlertCircle size={18} className="text-red-500" />}
                        {t.type === 'info' && <Info size={18} className="text-blue-500" />}

                        <span className="text-sm font-medium">{t.message}</span>

                        <button
                            onClick={() => removeToast(t.id)}
                            className="ml-2 hover:opacity-70 transition-opacity"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within a ToastProvider");
    return context;
}
