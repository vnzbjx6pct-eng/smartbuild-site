"use server";

import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";
import type { Cart, CartItem } from "@/app/types";
import { revalidatePath } from "next/cache";

// Helper to get or create a session ID for guests
async function getCartSessionId(): Promise<string> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("cart_session");

    if (sessionCookie?.value) {
        return sessionCookie.value;
    }

    const newSessionId = crypto.randomUUID();
    cookieStore.set("cart_session", newSessionId, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    return newSessionId;
}

// Fetch the current cart
export async function getCart(): Promise<Cart> {
    const supabase = await createSupabaseServerClient();
    const sessionId = await getCartSessionId();

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
        .from('cart_items')
        .select(`
            id,
            product_id,
            quantity,
            product:products (
                id,
                name,
                price,
                image_url,
                stock,
                category,
                description,
                unit,
                partner_id
            )
        `);

    if (user) {
        query = query.eq('user_id', user.id);
    } else {
        query = query.eq('session_id', sessionId).is('user_id', null);
    }

    const { data: items, error } = await query;

    if (error) {
        console.error("Error fetching cart:", error);
        return { items: [], total: 0, itemsCount: 0 };
    }

    // Process items to match CartItem interface (handling Supabase join structure)
    // @ts-expect-error - Supabase types join handling
    const cartItems: CartItem[] = items.map(item => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        product: item.product
    }));

    const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const itemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return { items: cartItems, total, itemsCount };
}

export async function addToCart(productId: string, quantity: number = 1) {
    const supabase = await createSupabaseServerClient();
    const sessionId = await getCartSessionId();
    const { data: { user } } = await supabase.auth.getUser();

    // Check if item exists
    let existingQuery = supabase.from('cart_items').select('id, quantity');

    if (user) {
        existingQuery = existingQuery.eq('user_id', user.id).eq('product_id', productId);
    } else {
        existingQuery = existingQuery.eq('session_id', sessionId).is('user_id', null).eq('product_id', productId);
    }

    const { data: existingItems } = await existingQuery.single();

    if (existingItems) {
        // Update quantity
        const { error } = await supabase
            .from('cart_items')
            .update({ quantity: existingItems.quantity + quantity })
            .eq('id', existingItems.id);

        if (error) throw new Error(error.message);
    } else {
        // Insert new
        const { error } = await supabase
            .from('cart_items')
            .insert({
                user_id: user?.id || null,
                session_id: user ? null : sessionId,
                product_id: productId,
                quantity: quantity
            });

        if (error) throw new Error(error.message);
    }

    revalidatePath('/cart');
    revalidatePath('/products'); // Revalidate products if stock display depends on valid cart (not implementing stock deduction yet)
    return { success: true };
}

export async function removeFromCart(itemId: string) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from('cart_items').delete().eq('id', itemId);

    if (error) throw new Error(error.message);

    revalidatePath('/cart');
    return { success: true };
}

export async function updateCartItem(itemId: string, quantity: number) {
    const supabase = await createSupabaseServerClient();

    if (quantity <= 0) {
        return removeFromCart(itemId);
    }

    const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);

    if (error) throw new Error(error.message);

    revalidatePath('/cart');
    return { success: true };
}

export async function clearCart() {
    const supabase = await createSupabaseServerClient();
    const sessionId = await getCartSessionId();
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase.from('cart_items').delete();

    if (user) {
        query = query.eq('user_id', user.id);
    } else {
        query = query.eq('session_id', sessionId);
    }

    const { error } = await query;
    if (error) throw new Error(error.message);

    revalidatePath('/cart');
    return { success: true };
}
