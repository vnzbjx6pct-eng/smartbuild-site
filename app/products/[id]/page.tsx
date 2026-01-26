import { createSupabaseServerClient } from '@/app/lib/supabase/server';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
import type { Metadata } from 'next';
import { getProductImage } from '@/app/lib/imageUtils';

export const revalidate = 60;

type PartnerOffer = {
    id: string;
    product_id?: string | null;
    price: number | null;
    stock: number | null;
    unit: string | null;
    sku?: string | null;
    ean?: string | null;
    store_id?: string | null;
    store_name?: string | null;
    store?: {
        name?: string | null;
        brand_name?: string | null;
        city?: string | null;
    } | null;
};

export async function generateMetadata({
    params
}: {
    params: Promise<{ id: string }>
}): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    const { data: product } = await supabase
        .from('products')
        .select('name, description, image_url')
        .eq('id', id)
        .eq('is_active', true)
        .single();
    const metaImage = getProductImage(product ?? undefined);

    return {
        title: product ? `${product.name} - SmartBuild` : 'Toode puudub',
        description: product?.description ? product.description.substring(0, 160) : 'Ehitusmaterjalid parima hinnaga.',
        openGraph: {
            images: [metaImage],
        },
    };
}

export default async function ProductDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    // 1. Fetch Product with Partner Info
    const { data: product, error } = await supabase
        .from('products')
        .select(`
            *,
            profiles!products_partner_id_fkey (
                company_name,
                company_slug
            )
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

    if (error || !product) {
        notFound();
    }

    // 2. Fetch Partner Offers for Comparison
    let partnerOffers: PartnerOffer[] = [];
    let offersErrorMessage: string | null = null;

    try {
        let offersQuery = supabase
            .from("offers")
            .select("id, product_id, price, stock:stock_qty, unit, store_id, store_name:store");

        offersQuery = offersQuery.eq("product_id", product.id);

        const { data, error: offersError } = await offersQuery;
        if (offersError) {
            offersErrorMessage = "Partnerite pakkumiste laadimine ebaõnnestus. Proovi mõne hetke pärast uuesti.";
            console.error("[product] offers query failed", {
                productId: product.id,
                code: offersError.code ?? undefined,
                message: offersError.message ?? undefined,
            });
            partnerOffers = [];
        } else {
            partnerOffers = (data as PartnerOffer[] | null) ?? [];
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        offersErrorMessage = "Partnerite pakkumiste laadimine ebaõnnestus. Proovi mõne hetke pärast uuesti.";
        console.error("[product] offers query failed", {
            productId: product.id,
            message,
        });
        partnerOffers = [];
    }

    const offerStoreIds = Array.from(
        new Set((partnerOffers || [])
            .map((offer: any) => offer?.store_id)
            .filter((id: string | null | undefined): id is string => Boolean(id)))
    );

    let storeMap = new Map<string, { name?: string | null; brand_name?: string | null; city?: string | null }>();
    if (offerStoreIds.length > 0) {
        const { data: stores, error: storesError } = await supabase
            .from("stores")
            .select("id, name, brand_name, city")
            .in("id", offerStoreIds);

        if (!storesError) {
            storeMap = new Map((stores || []).map((store: any) => [store.id, store]));
        }
    }

    const normalizeOffer = (offer: PartnerOffer): PartnerOffer => {
        const normalizedStock = offer.stock === null || offer.stock === undefined ? null : Number(offer.stock);
        const safeStock = Number.isFinite(normalizedStock) ? normalizedStock : null;
        const normalizedPrice = Number(offer.price);
        const safePrice = Number.isFinite(normalizedPrice) && normalizedPrice > 0 ? normalizedPrice : null;
        const store = offer.store_id ? storeMap.get(offer.store_id) : null;
        return {
            ...offer,
            price: safePrice,
            stock: safeStock,
            store
        };
    };
    const offers: PartnerOffer[] = (partnerOffers || []).map(normalizeOffer);

    const pricedOffers = offers.filter((offer) => typeof offer.price === "number" && offer.price > 0);

    const sortedByBest = [...offers].sort((a, b) => {
        const aPrice = typeof a.price === "number" ? a.price : Number.POSITIVE_INFINITY;
        const bPrice = typeof b.price === "number" ? b.price : Number.POSITIVE_INFINITY;
        if (aPrice !== bPrice) return aPrice - bPrice;
        const aStock = typeof a.stock === 'number' ? a.stock : -1;
        const bStock = typeof b.stock === 'number' ? b.stock : -1;
        return bStock - aStock;
    });

    const bestOffer = sortedByBest[0] || null;

    const prices = pricedOffers.map((offer) => Number(offer.price)).filter((price) => Number.isFinite(price) && price > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : null;
    const avgPrice = prices.length > 0
        ? Math.round((prices.reduce((sum, price) => sum + price, 0) / prices.length) * 100) / 100
        : null;

    const hasAnyAvailableStock = offers.some((offer) => offer.stock !== 0);
    const productStockIsAvailable = product?.stock !== 0;
    const isAvailable = offers.length > 0 ? hasAnyAvailableStock : productStockIsAvailable;

    console.log("[product] offer summary", {
        productId: product.id,
        offersLength: offers.length,
        bestOffer: bestOffer
            ? { id: bestOffer.id, price: bestOffer.price, stock: bestOffer.stock }
            : null,
        isAvailable,
    });

    // 3. Fetch Similar Products
    const { data: similarProducts } = await supabase
        .from('products')
        .select('id, name, price, image_url, category')
        .eq('category', product.category)
        .eq('is_active', true)
        .neq('id', id)
        .limit(4);

    // JSON-LD Structured Data
    const bestPrice = bestOffer?.price ?? product.price;
    const bestSeller = bestOffer?.store?.name || bestOffer?.store?.brand_name || bestOffer?.store_name || product.profiles?.company_name;
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: [getProductImage(product)],
        offers: {
            '@type': 'Offer',
            price: bestPrice,
            priceCurrency: 'EUR',
            availability: isAvailable
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            seller: {
                '@type': 'Organization',
                name: bestSeller
            }
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ProductDetailClient
                product={product}
                partnerOffers={offers}
                bestOfferId={bestOffer?.id || null}
                minPrice={minPrice}
                maxPrice={maxPrice}
                avgPrice={avgPrice}
                isAvailable={isAvailable}
                offersErrorMessage={offersErrorMessage}
                similarProducts={similarProducts || []}
            />
        </>
    );
}
