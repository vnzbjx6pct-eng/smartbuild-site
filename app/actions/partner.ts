'use server'

import { supabase } from "@/app/lib/supabaseServer";
import type { PartnerProductDraft } from "@/app/lib/partner/csv";

// Helper to get or create a store for the user
async function getOrCreateStore(userId: string) {
    // 1. Try to find existing store
    const { data: store } = await supabase
        .from('partner_stores')
        .select('id, name')
        .eq('owner_id', userId)
        .single();

    if (store) return { store, error: null };

    // 2. If not found (and no error other than not found), create one
    const { data: newStore, error: createError } = await supabase
        .from('partner_stores')
        .insert({ owner_id: userId, name: 'My Store' })
        .select('id, name')
        .single();

    return { store: newStore, error: createError };
}

export async function savePartnerProducts(products: PartnerProductDraft[]) {
    if (!products || products.length === 0) return { success: true, count: 0 };

    // 1. Auth check using secure cookie-based client
    const { cookies } = await import("next/headers");
    const { createServerComponentClient } = await import("@supabase/auth-helpers-nextjs");
    const cookieStore = cookies();
    const supabaseAuth = createServerComponentClient({ cookies: () => cookieStore });

    const { data: { session } } = await supabaseAuth.auth.getSession();
    if (!session?.user) {
        return { success: false, error: "Unauthorized" };
    }
    const userId = session.user.id;

    // 2. Get/Create Store
    const { store, error: storeError } = await getOrCreateStore(userId);
    if (storeError || !store) {
        console.error("Store creation error:", storeError);
        return { success: false, error: "Count not find or create store." };
    }

    // 3. Format rows
    const rows = products.map(p => ({
        store_id: store.id,
        product_name: p.product_name,
        category: p.category,
        subcategory: p.subcategory,
        price: p.price,
        stock: p.stock,
        unit: 'pcs', // Default
        availability: p.stock > 0 ? 'In Stock' : 'Out of Stock',

        // Detailed fields
        description: p.description,
        sku: p.sku,
        ean: p.ean,
        delivery_days: p.delivery_days,

        // Categorization fields
        normalized_category: p.auto_category,
        normalized_subcategory: p.auto_subcategory,
        categorization_confidence: p.confidence ? parseFloat(p.confidence.replace('%', '')) / 100 : null,

        // Save original row for debugging if needed (optional)
        // source_csv_row: p, 

        status: 'active'
    }));

    // 4. Insert
    try {
        const { error } = await supabase
            .from('partner_products')
            .insert(rows);

        if (error) {
            console.error("Supabase Import Error:", error);
            return { success: false, error: error.message };
        }

        return { success: true, count: rows.length };
    } catch (e: unknown) {
        console.error("Server Action Error:", e);
        return { success: false, error: "Internal Server Error" };
    }
}

export async function getPartnerProducts() {
    const { cookies } = await import("next/headers");
    const { createServerComponentClient } = await import("@supabase/auth-helpers-nextjs");
    const cookieStore = cookies();
    const supabaseAuth = createServerComponentClient({ cookies: () => cookieStore });

    const { data: { session } } = await supabaseAuth.auth.getSession();
    if (!session?.user) {
        return { success: false, error: "Unauthorized" };
    }
    const userId = session.user.id;

    // Get Store
    const { data: store } = await supabase
        .from('partner_stores')
        .select('id')
        .eq('owner_id', userId)
        .single();

    if (!store) {
        return { success: true, data: [] };
    }

    // Fetch Products
    const { data, error } = await supabase
        .from('partner_products')
        .select('*')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Fetch Error:", error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}
