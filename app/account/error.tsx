"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="p-6 bg-red-50/50 border border-red-100 rounded-xl flex items-start gap-4">
            <div className="text-red-500 shrink-0">
                <AlertCircle size={24} />
            </div>
            <div>
                <h3 className="font-bold text-red-900">Viga andmete laadimisel</h3>
                <p className="text-sm text-red-700 mt-1 mb-3">
                    Ei suutnud konto andmeid laadida. Palun proovi uuesti.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={() => reset()}
                        className="text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
                    >
                        Proovi uuesti
                    </button>
                </div>
            </div>
        </div>
    );
}
