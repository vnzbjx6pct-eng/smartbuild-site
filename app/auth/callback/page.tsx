"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const handleAuth = async () => {
            // Check if we have a hash in URL (Implicit flow / legacy) or if supabase detects session
            // The newer Supabase client handles the token exchange automatically if detectSessionInUrl is true.
            // We just need to wait a moment or check if session exists, then redirect.

            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error("Auth callback error:", error);
                router.push("/login?error=auth_callback_error");
                return;
            }

            if (session) {
                console.log("Auth callback success, redirecting to home");
                router.push("/");
            } else {
                // Wait for the client to process the hash
                const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: any) => {
                    if (event === 'SIGNED_IN' && session) {
                        router.push("/");
                    }
                });

                // Fallback timeout
                setTimeout(() => {
                    router.push("/?warning=auth_timeout");
                }, 3000);

                return () => subscription.unsubscribe();
            }
        };

        handleAuth();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-white/20 border-t-emerald-500 rounded-full animate-spin"></div>
                <p className="text-slate-400 text-sm">Finishing login...</p>
            </div>
        </div>
    );
}
