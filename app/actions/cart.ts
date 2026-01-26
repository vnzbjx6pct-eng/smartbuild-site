"use server";

import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import type { Cart, CartItem, Product } from "@/app/types";
import { revalidatePath } from "next/cache";

type CartActionResult = {
    success: boolean;
    error?: string;
    debug?: {
        offerId?: string | null;
        userId?: string | null;
        step?: string;
        supabaseError?: {
            code?: string | null;
            message?: string | null;
            details?: string | null;
            hint?: string | null;
        };
        offerSnapshot?: {
            price?: number | string | null;
            unit_price?: number | string | null;
            currency?: string | null;
            unit?: string | null;
        };
    };
};

const logSupabaseError = (
    context: string,
    error: { code?: string | null; message?: string | null; details?: string | null; hint?: string | null } | null
) => {
    if (!error) return;
    console.error(`[cart] ${context}`, {
        code: error.code ?? undefined,
        message: error.message ?? undefined,
        details: error.details ?? undefined,
        hint: error.hint ?? undefined
    });
};

const buildSupabaseDebug = (
    error: { code?: string | null; message?: string | null; details?: string | null; hint?: string | null } | null
) => {
    if (!error) return undefined;
    return {
        code: error.code ?? null,
        message: error.message ?? null,
        details: error.details ?? null,
        hint: error.hint ?? null
    };
};

// DB check (Supabase SQL editor):
// select column_name, is_nullable, data_type
// from information_schema.columns
// where table_schema = 'public' and table_name = 'cart_items'
// order by ordinal_position;
// Manual test plan:
// 1) Login, open product catalog, click "Lisa korvi".
// 2) Confirm cart sidebar opens and count increments.
// 3) Verify cart_items row has non-null unit_price/currency/unit/etc.

const getUserId = async (
    supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<string | null> => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) logSupabaseError("get user", userError);
    return user?.id ?? null;
};

// Fetch the current cart
export async function getCart(): Promise<Cart> {
    const supabase = await createSupabaseServerClient();
    const userId = await getUserId(supabase);
    if (!userId) {
        return { items: [], total: 0, itemsCount: 0 };
    }

    const { data: items, error } = await supabase
        .from("cart_items")
        .select("offer_id, quantity")
        .eq("user_id", userId);

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
            stock:stock_qty,
            unit,
            image_url,
            store_id,
            store_name:store,
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
            .select("id, product_id, price, stock:stock_qty, unit, store_id, store_name:store")
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
                name: baseProduct?.name || "Toode",
                description: baseProduct?.description || "",
                price: offerPrice,
                category: baseProduct?.category || "",
                image_url: baseProduct?.image_url ?? null,
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

export async function addToCart(
    offerId: string,
    quantity: number = 1,
    debug?: {
        bestOfferId?: string | null;
        bestOfferPrice?: number | null;
        bestOfferStock?: number | null;
        offersLength?: number;
        isAvailable?: boolean;
    }
): Promise<CartActionResult> {
    let resolvedUserId: string | null = null;
    try {
        const isDev = process.env.NODE_ENV !== "production";
        const supabase = await createSupabaseServerClient();
        const userId = await getUserId(supabase);
        resolvedUserId = userId;

        console.log("[cart] addToCart start", { offerId, userId });

        if (!offerId) {
            const debugPayload = { offerId, userId, step: "invalid_offer" };
            return {
                success: false,
                error: "INVALID_OFFER",
                ...(isDev ? { debug: debugPayload } : {})
            };
        }

        if (!userId) {
            const debugPayload = { offerId, userId, step: "login_required" };
            return {
                success: false,
                error: "LOGIN_REQUIRED",
                ...(isDev ? { debug: debugPayload } : {})
            };
        }

        if (debug) {
            console.log("[cart] add debug", debug);
        }

        const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1;

        const { data: offer, error: offerError } = await supabase
            .from("offers")
            .select("*")
            .eq("id", offerId)
            .maybeSingle();

        if (offerError) {
            logSupabaseError("fetch offer for cart", offerError);
            const debugPayload = {
                offerId,
                userId,
                step: "select_offer",
                supabaseError: buildSupabaseDebug(offerError)
            };
            return {
                success: false,
                error: "ADD_TO_CART_FAILED",
                ...(isDev ? { debug: debugPayload } : {})
            };
        }

        if (!offer) {
            const debugPayload = { offerId, userId, step: "invalid_offer" };
            return {
                success: false,
                error: "INVALID_OFFER",
                ...(isDev ? { debug: debugPayload } : {})
            };
        }

        const resolvedUnitPrice = offer.price ?? null;
        const offerSnapshot = {
            price: offer.price ?? null,
            unit_price: resolvedUnitPrice
        };

        const missingFields: string[] = [];
        if (resolvedUnitPrice === null || resolvedUnitPrice === undefined) missingFields.push("unit_price");

        if (missingFields.length > 0) {
            const debugPayload = {
                offerId,
                userId,
                step: "offer_missing_fields",
                supabaseError: {
                    code: "MISSING_OFFER_FIELDS",
                    message: `Missing required offer fields: ${missingFields.join(", ")}`,
                    details: null,
                    hint: null
                },
                offerSnapshot
            };
            return {
                success: false,
                error: "ADD_TO_CART_FAILED",
                ...(isDev ? { debug: debugPayload } : {})
            };
        }

        // Check if item exists for this user + offer
        const { data: existingItem, error: existingError } = await supabase
            .from("cart_items")
            .select("quantity")
            .eq("offer_id", offerId)
            .eq("user_id", userId)
            .maybeSingle();

        console.log("[cart] addToCart existing item", {
            offerId,
            userId,
            existingItem,
            existingError
        });

        if (existingError) {
            logSupabaseError("check existing cart item", existingError);
            const debugPayload = {
                offerId,
                userId,
                step: "select_existing",
                supabaseError: buildSupabaseDebug(existingError)
            };
            return {
                success: false,
                error: "ADD_TO_CART_FAILED",
                ...(isDev ? { debug: debugPayload } : {})
            };
        }

        if (existingItem) {
            const existingQty = Number(existingItem.quantity ?? 0);
            const { error: updateError } = await supabase
                .from("cart_items")
                .update({
                    quantity: existingQty + safeQuantity,
                    unit_price: resolvedUnitPrice
                })
                .eq("offer_id", offerId)
                .eq("user_id", userId);

            console.log("[cart] addToCart update", {
                offerId,
                userId,
                updateError
            });

            if (updateError) {
                logSupabaseError("update cart quantity", updateError);
                const debugPayload = {
                    offerId,
                    userId,
                    step: "update_existing",
                    supabaseError: buildSupabaseDebug(updateError),
                    offerSnapshot
                };
                return {
                    success: false,
                    error: "ADD_TO_CART_FAILED",
                    ...(isDev ? { debug: debugPayload } : {})
                };
            }
        } else {
            const { error: insertError } = await supabase
                .from("cart_items")
                .insert({
                    user_id: userId,
                    offer_id: offerId,
                    quantity: safeQuantity,
                    unit_price: resolvedUnitPrice
                });

            console.log("[cart] addToCart insert", {
                offerId,
                userId,
                insertError
            });

            if (insertError) {
                logSupabaseError("insert cart item", insertError);
                const debugPayload = {
                    offerId,
                    userId,
                    step: "insert_new",
                    supabaseError: buildSupabaseDebug(insertError),
                    offerSnapshot
                };
                return {
                    success: false,
                    error: "ADD_TO_CART_FAILED",
                    ...(isDev ? { debug: debugPayload } : {})
                };
            }
        }

        revalidatePath('/cart');
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("[cart] addToCart failed", { message });
        const isDev = process.env.NODE_ENV !== "production";
        const debugPayload = {
            offerId,
            userId: resolvedUserId,
            step: "exception"
        };
        return {
            success: false,
            error: "ADD_TO_CART_FAILED",
            ...(isDev ? { debug: debugPayload } : {})
        };
    }
}

export async function removeFromCart(offerId: string): Promise<CartActionResult> {
    const supabase = await createSupabaseServerClient();
    const userId = await getUserId(supabase);
    if (!userId) {
        return { success: false, error: "LOGIN_REQUIRED" };
    }

    const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("offer_id", offerId)
        .eq("user_id", userId);

    if (error) {
        logSupabaseError("remove cart item", error);
        return { success: false, error: "REMOVE_FROM_CART_FAILED" };
    }

    revalidatePath('/cart');
    return { success: true };
}

export async function updateCartItemQuantity(offerId: string, quantity: number): Promise<CartActionResult> {
    const supabase = await createSupabaseServerClient();
    const userId = await getUserId(supabase);
    if (!userId) {
        return { success: false, error: "LOGIN_REQUIRED" };
    }

    const safeQuantity = Number.isFinite(quantity) ? Math.floor(quantity) : 0;
    if (safeQuantity <= 0) {
        return removeFromCart(offerId);
    }

    const { error } = await supabase
        .from("cart_items")
        .update({ quantity: safeQuantity })
        .eq("offer_id", offerId)
        .eq("user_id", userId);

    if (error) {
        logSupabaseError("update cart item quantity", error);
        return { success: false, error: "UPDATE_CART_FAILED" };
    }

    revalidatePath('/cart');
    return { success: true };
}

export async function clearCart(): Promise<CartActionResult> {
    const supabase = await createSupabaseServerClient();
    const userId = await getUserId(supabase);
    if (!userId) {
        return { success: false, error: "LOGIN_REQUIRED" };
    }

    const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", userId);
    if (error) {
        logSupabaseError("clear cart", error);
        return { success: false, error: "CLEAR_CART_FAILED" };
    }

    revalidatePath('/cart');
    return { success: true };
}
