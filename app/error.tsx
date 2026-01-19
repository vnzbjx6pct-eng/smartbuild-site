"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const [errorId] = useState<string>(() => {
        return `ERR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    });

    useEffect(() => {
        console.error(`[GlobalError] ${errorId}:`, error);

        // Optional: Send to logging service
        // fetch('/api/log-error', { ... })
    }, [error, errorId]);

    return (
        <html>
            <body className="bg-slate-950 text-slate-100 font-sans min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center">
                    <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle size={32} />
                    </div>

                    <h2 className="text-2xl font-bold mb-2">Midagi läks valesti</h2>
                    <h3 className="text-lg text-slate-400 mb-6">Something went wrong</h3>

                    <p className="text-slate-500 text-sm mb-6">
                        Tekkis ootamatu viga. Palun proovi uuesti või võta ühendust toega.
                        <br />
                        <span className="font-mono text-xs opacity-70 mt-2 block select-all">ID: {errorId}</span>
                        {error.digest && <span className="font-mono text-xs opacity-50 block select-all">Digest: {error.digest}</span>}
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={() => reset()}
                            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition-colors"
                        >
                            <RefreshCcw size={18} />
                            Proovi uuesti / Try Again
                        </button>

                        <Link
                            href="/"
                            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 rounded-xl transition-colors"
                        >
                            <Home size={18} />
                            Tagasi avalehele / Back Home
                        </Link>
                    </div>
                </div>
            </body>
        </html>
    );
}
