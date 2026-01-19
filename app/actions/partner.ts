'use server'

import { createClient } from "@supabase/supabase-js";

// Initialize admin client for server actions (or use standard server client pattern)
// Using process.env directly for now as per project context if available, 
// or falling back to the existing supabaseServer if it exports what we need.
// But usually for Server Actions we prefer creating a client with cookies or direct env if service role.
// Since we don't have cookies easily here without `next/headers`, and I saw `app/lib/supabaseServer.ts` previously.
// Let's check `app/lib/supabaseServer.ts` usage pattern. 
// Step 283 used `import { supabase } from "@/app/lib/supabaseServer";` in a route handler.
// So I will use that.

import { supabase } from "@/app/lib/supabaseServer";

export async function savePartnerProducts(products: any[], storeId: string) {
    if (!products || products.length === 0) return { success: true, count: 0 };
    if (!storeId) return { success: false, error: "Missing store ID" };

    // Format for DB
    const rows = products.map(p => ({
        store_id: storeId,
        product_name: p.product_name || p.name || 'Unknown',
        category: p.category,
        price: parseFloat(p.price) || 0,
        unit: p.unit,
        availability: p.availability || 'In Stock',

        // Categorization fields
        normalized_category: p.auto_category,
        normalized_subcategory: p.auto_subcategory,
        categorization_confidence: p.confidence ? parseFloat(p.confidence.replace('%', '')) / 100 : null,

        // Validation/Status
        status: 'draft'
    }));

    try {
        const { error } = await supabase
            .from('partner_products')
            .insert(rows);

        if (error) {
            console.error("Supabase Import Error:", error);
            return { success: false, error: error.message };
        }

        return { success: true, count: rows.length };
    } catch (e) {
        console.error("Server Action Error:", e);
        return { success: false, error: "Internal Server Error" };
    }
}
