import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { getPartnerProducts } from "@/app/actions/partner";
import PartnerDashboardClient from "./PartnerDashboardClient";
import { redirect } from "next/navigation";

// Define a type for the products matched in Client Component
interface PartnerProduct {
    id: string;
    name: string;
    category: string | null;
    price: number;
    stock: number;
    is_active: boolean;
}

export default async function PartnerDashboardPage() {
    const supabase = await createSupabaseServerClient();

    const { data: { session } } = await supabase.auth.getSession();

    // Redirect if not logged in
    if (!session) {
        redirect("/login?next=/account/partner");
    }

    // Check if partner
    // We can't reuse "isPartner" logic directly if it expects supabase client with specific flavor, 
    // but usually we can check profile role directly here or use a server-friendly helper.
    // For now, doing a direct check similar to actions.
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

    const isAuthorized = profile?.role === 'partner';

    // Fetch products
    let products: PartnerProduct[] = [];
    if (isAuthorized) {
        const result = await getPartnerProducts();
        if (result.success && result.data) {
            products = result.data.map(p => ({
                id: p.id,
                name: p.name,
                category: p.category,
                price: p.price,
                stock: p.stock,
                is_active: p.is_active
            }));
        }
    }

    return (
        <PartnerDashboardClient
            initialProducts={products}
            isAuthorized={isAuthorized}
        />
    );
}
