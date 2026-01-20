import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import PartnerSidebar from "./PartnerSidebar";

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createSupabaseServerClient();

    // 1. Check Session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        redirect("/login");
    }

    // 2. Check Permissions (Partner Role)
    // We already have middleware, but double check here or fetch store details is good practice
    // Middleware redirects non-partners to /account.
    // Fetch generic profile or store info if needed.

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, store_name')
        .eq('id', session.user.id)
        .single();

    const isPartner = profile?.role === 'partner';

    // Optional: If middleware missed it or direct access
    if (!isPartner) {
        redirect("/account");
    }

    const storeName = profile?.store_name || "Partner Store";

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <PartnerSidebar storeName={storeName} />

            {/* CONTENT AREA */}
            <main className="flex-1 overflow-auto">
                <div className="container mx-auto px-8 py-8 max-w-6xl">
                    {children}
                </div>
            </main>
        </div>
    );
}

