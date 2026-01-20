'use server'

import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
    const supabase = await createSupabaseServerClient();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Unauthorized");

    const rawData = {
        name: formData.get('name') as string,
        price: Number(formData.get('price')),
        description: formData.get('description') as string,
        stock: Number(formData.get('stock')),
        category: formData.get('category') as string,
        is_active: formData.get('is_active') === 'on',
        partner_id: session.user.id
    };

    const { error } = await supabase.from('products').insert(rawData);

    if (error) {
        console.error("Create Product Error:", error);
        throw new Error("Failed to create product");
    }

    revalidatePath('/partner/products');
}

export async function updateProduct(id: string, formData: FormData) {
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Unauthorized");

    const rawData = {
        name: formData.get('name') as string,
        price: Number(formData.get('price')),
        description: formData.get('description') as string,
        stock: Number(formData.get('stock')),
        category: formData.get('category') as string,
        is_active: formData.get('is_active') === 'on',
    };

    // RLS will ensure we can only update own products, but good to be explicit
    const { error } = await supabase
        .from('products')
        .update(rawData)
        .eq('id', id)
        .eq('partner_id', session.user.id);

    if (error) {
        console.error("Update Product Error:", error);
        throw new Error("Failed to update product");
    }

    revalidatePath('/partner/products');
}

export async function toggleProductStatus(id: string, isActive: boolean) {
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Unauthorized");

    const { error } = await supabase
        .from('products')
        .update({ is_active: isActive })
        .eq('id', id)
        .eq('partner_id', session.user.id);

    if (error) throw new Error("Failed to toggle status");
    revalidatePath('/partner/products');
}
