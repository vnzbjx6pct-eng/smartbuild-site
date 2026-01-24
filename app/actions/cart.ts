"use server";

import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";
import type { Cart, CartItem, Product } from "@/app/types";
import { revalidatePath } from "next/cache";

type CartActionResult = {
    success: boolean;
    error?: string;
};

const logSupabaseError = (context: string, error: { code?: string | null; message?: string | null } | null) => {
    if (!error) return;
    console.error(`[cart] ${context}`, {
        code: error.code ?? undefined,
        message: error.message ?? undefined
    });
};

const CART_SESSION_COOKIE = "sb_cart_session_id";
const CART_SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

type CartOwner = { userId?: string; sessionId?: string };

const getCartOwner = async (ensureSession: boolean, supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>): Promise<CartOwner> => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) logSupabaseError("get user", userError);

    if (user?.id) {
        return { userId: user.id };
    }

    const cookieStore = await cookies();
    let sessionId = cookieStore.get(CART_SESSION_COOKIE)?.value;

    if (!sessionId && ensureSession) {
        sessionId = crypto.randomUUID();
        cookieStore.set(CART_SESSION_COOKIE, sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: CART_SESSION_MAX_AGE,
            path: "/",
        });
    }

    return sessionId ? { sessionId } : {};
};

// Fetch the current cart
export async function getCart(): Promise<Cart> {
    const supabase = await createSupabaseServerClient();
    const cartOwner = await getCartOwner(false, supabase);
    if (!cartOwner.userId && !cartOwner.sessionId) {
        return { items: [], total: 0, itemsCount: 0 };
    }

    const baseQuery = supabase
        .from("cart_items")
        .select("offer_id, quantity");

    const { data: items, error } = cartOwner.userId
        ? await baseQuery.eq("user_id", cartOwner.userId)
        : await baseQuery.eq("session_id", cartOwner.sessionId);

    if (error) {
        logSupabaseError("fetch cart items", error);
        return { items: [], total: 0, itemsCount: 0 };
    }

    if (!items || items.length === 0) {
        return { items: [], total: 0, itemsCount: 0 };
    }

    const offerIds = Array.from(new Set(items.map((item) => item.offer_id).filter(Boolean)));
    if (offerIds.length === 0) {
        return { items: [], total: 0, itemsCount: 0 };
    }

    let offers: any[] | null = null;
    let offersError: { code?: string | null; message?: string | null } | null = null;

    const offersWithStore = await supabase
        .from("offers")
        .select(`
            id,
            product_id,
            price,
            stock,
            unit,
            name,
            image_url,
            store_id,
            store_name,
            stores (
                name,
                brand_name,
                city
            )
        `)
        .in("id", offerIds);

    if (offersWithStore.error) {
        const fallbackOffers = await supabase
            .from("offers")
            .select("id, product_id, price, stock, unit, name, image_url, store_id, store_name")
            .in("id", offerIds);
        offers = fallbackOffers.data ?? null;
        offersError = fallbackOffers.error ?? null;
    } else {
        offers = offersWithStore.data ?? null;
    }

    if (offersError) {
        logSupabaseError("fetch offers", offersError);
        const fallbackItems: CartItem[] = items.map((item) => ({
            id: item.offer_id,
            offer_id: item.offer_id,
            product_id: item.offer_id,
            quantity: item.quantity,
            product: {
                id: item.offer_id,
                name: "Toode",
                description: "",
                price: 0,
                category: "",
                image_url: null,
                stock: 0,
                unit: "",
                is_active: true,
                partner_id: "",
                created_at: ""
            }
        }));
        return {
            items: fallbackItems,
            total: fallbackItems.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0),
            itemsCount: fallbackItems.reduce((sum, item) => sum + item.quantity, 0)
        };
    }

    if (!offers || offers.length === 0) {
        const fallbackItems: CartItem[] = items.map((item) => ({
            id: item.offer_id,
            offer_id: item.offer_id,
            product_id: item.offer_id,
            quantity: item.quantity,
            product: {
                id: item.offer_id,
                name: "Toode",
                description: "",
                price: 0,
                category: "",
                image_url: null,
                stock: 0,
                unit: "",
                is_active: true,
                partner_id: "",
                created_at: ""
            }
        }));
        return {
            items: fallbackItems,
            total: fallbackItems.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0),
            itemsCount: fallbackItems.reduce((sum, item) => sum + item.quantity, 0)
        };
    }

    const offerMap = new Map((offers ?? []).map((offer) => [offer.id, offer]));
    const productIds = Array.from(
        new Set(
            (offers ?? [])
                .map((offer) => offer?.product_id)
                .filter((id: string | null | undefined): id is string => Boolean(id))
        )
    );

    let productMap = new Map<string, any>();
    if (productIds.length > 0) {
        const { data: products, error: productsError } = await supabase
            .from("products")
            .select(`
                id,
                name,
                price,
                image_url,
                stock,
                category,
                description,
                unit,
                is_active,
                partner_id,
                sku,
                created_at,
                profiles!products_partner_id_fkey (
                    company_name,
                    company_slug,
                    city
                )
            `)
            .in("id", productIds)
            .eq("is_active", true);

        if (productsError) {
            logSupabaseError("fetch products for cart", productsError);
        } else {
            productMap = new Map((products ?? []).map((product) => [product.id, product]));
        }
    }

    const cartItems: CartItem[] = items
        .map((item) => {
            const offer = offerMap.get(item.offer_id);
            if (!offer) return null;

            const productId = offer?.product_id || "";
            const baseProduct = productMap.get(productId);
            const offerPrice = Number(offer?.price ?? baseProduct?.price ?? 0);
            const offerUnit = offer?.unit ?? baseProduct?.unit ?? "";
            const offerStock = typeof offer?.stock === "number" ? offer.stock : baseProduct?.stock ?? 0;

            const fallbackProduct: Product = {
                id: productId || offer.id,
                name: offer?.name || "Unknown",
                description: baseProduct?.description || "",
                price: offerPrice,
                category: baseProduct?.category || "",
                image_url: offer?.image_url ?? null,
                stock: offerStock,
                unit: offerUnit,
                is_active: true,
                partner_id: baseProduct?.partner_id || "",
                sku: baseProduct?.sku,
                created_at: baseProduct?.created_at || "",
                profiles: baseProduct?.profiles
            };

            return {
                id: item.offer_id,
                offer_id: item.offer_id,
                product_id: productId || offer.id,
                quantity: item.quantity,
                product: baseProduct
                    ? {
                        ...baseProduct,
                        price: offerPrice,
                        unit: offerUnit,
                        stock: offerStock
                    }
                    : fallbackProduct
            };
        })
        .filter((item): item is CartItem => item !== null);

    const total = cartItems.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
    const itemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return { items: cartItems, total, itemsCount };
}

export async function addToCart(offerId: string, quantity: number = 1): Promise<CartActionResult> {
    const supabase = await createSupabaseServerClient();
    const cartOwner = await getCartOwner(true, supabase);
    if (!cartOwner.userId && !cartOwner.sessionId) {
        return { success: false, error: "ADD_TO_CART_FAILED" };
    }

    if (!offerId) {
        return { success: false, error: "INVALID_OFFER" };
    }

    const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1;

    // Check if item exists
    const { data: existingItems, error: existingError } = await supabase
        .from("cart_items")
        .select("quantity")
        .eq("offer_id", offerId)
        .eq(cartOwner.userId ? "user_id" : "session_id", cartOwner.userId ?? cartOwner.sessionId)
        .limit(1);

    if (existingError) {
        logSupabaseError("check existing cart item", existingError);
        return { success: false, error: "ADD_TO_CART_FAILED" };
    }

    const existingItem = existingItems?.[0];
    if (existingItem) {
        const existingQty = Number(existingItem.quantity ?? 0);
        const { error: updateError } = await supabase
            .from("cart_items")
            .update({ quantity: existingQty + safeQuantity })
            .eq("offer_id", offerId)
            .eq(cartOwner.userId ? "user_id" : "session_id", cartOwner.userId ?? cartOwner.sessionId);

        if (updateError) {
            logSupabaseError("update cart quantity", updateError);
            return { success: false, error: "ADD_TO_CART_FAILED" };
        }
    } else {
        const { error: insertError } = await supabase
            .from("cart_items")
            .insert({
                user_id: cartOwner.userId ?? null,
                session_id: cartOwner.sessionId ?? null,
                offer_id: offerId,
                quantity: safeQuantity
            });

        if (insertError) {
            logSupabaseError("insert cart item", insertError);
            return { success: false, error: "ADD_TO_CART_FAILED" };
        }
    }

    revalidatePath('/cart');
    return { success: true };
}

export async function removeFromCart(offerId: string): Promise<CartActionResult> {
    const supabase = await createSupabaseServerClient();
    const cartOwner = await getCartOwner(false, supabase);
    if (!cartOwner.userId && !cartOwner.sessionId) {
        return { success: true };
    }

    const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("offer_id", offerId)
        .eq(cartOwner.userId ? "user_id" : "session_id", cartOwner.userId ?? cartOwner.sessionId);

    if (error) {
        logSupabaseError("remove cart item", error);
        return { success: false, error: "REMOVE_FROM_CART_FAILED" };
    }

    revalidatePath('/cart');
    return { success: true };
}

export async function updateCartItemQuantity(offerId: string, quantity: number): Promise<CartActionResult> {
    const supabase = await createSupabaseServerClient();
    const cartOwner = await getCartOwner(false, supabase);
    if (!cartOwner.userId && !cartOwner.sessionId) {
        return { success: true };
    }

    const safeQuantity = Number.isFinite(quantity) ? Math.floor(quantity) : 0;
    if (safeQuantity <= 0) {
        return removeFromCart(offerId);
    }

    const { error } = await supabase
        .from("cart_items")
        .update({ quantity: safeQuantity })
        .eq("offer_id", offerId)
        .eq(cartOwner.userId ? "user_id" : "session_id", cartOwner.userId ?? cartOwner.sessionId);

    if (error) {
        logSupabaseError("update cart item quantity", error);
        return { success: false, error: "UPDATE_CART_FAILED" };
    }

    revalidatePath('/cart');
    return { success: true };
}

export async function clearCart(): Promise<CartActionResult> {
    const supabase = await createSupabaseServerClient();
    const cartOwner = await getCartOwner(false, supabase);
    if (!cartOwner.userId && !cartOwner.sessionId) {
        return { success: true };
    }

    const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq(cartOwner.userId ? "user_id" : "session_id", cartOwner.userId ?? cartOwner.sessionId);
    if (error) {
        logSupabaseError("clear cart", error);
        return { success: false, error: "CLEAR_CART_FAILED" };
    }

    revalidatePath('/cart');
    return { success: true };
}
