'use server'

import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(id: string, newStatus: string) {
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Unauthorized");

    const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('partner_id', session.user.id);

    if (error) {
        console.error("Update Order Error:", error);
        throw new Error("Failed to update order");
    }

    revalidatePath('/partner/orders');
}
