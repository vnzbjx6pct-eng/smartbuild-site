import { createServerClient } from '@/app/lib/supabase/server';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata({
    params
}: {
    params: Promise<{ id: string }>
}): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createServerClient();

    const { data: product } = await supabase
        .from('products')
        .select('name, description, image_url')
        .eq('id', id)
        .eq('is_active', true)
        .single();

    return {
        title: product ? `${product.name} - SmartBuild` : 'Toode puudub',
        description: product?.description ? product.description.substring(0, 160) : 'Ehitusmaterjalid parima hinnaga.',
        openGraph: {
            images: product?.image_url ? [product.image_url] : [],
        },
    };
}

export default async function ProductDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const supabase = await createServerClient();

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

    // 2. Fetch Similar Products
    const { data: similarProducts } = await supabase
        .from('products')
        .select('id, name, price, image_url, category')
        .eq('category', product.category)
        .eq('is_active', true)
        .neq('id', id)
        .limit(4);

    // JSON-LD Structured Data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.image_url ? [product.image_url] : [],
        offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'EUR',
            availability: product.stock > 0
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            seller: {
                '@type': 'Organization',
                name: product.profiles?.company_name
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
                similarProducts={similarProducts || []}
            />
        </>
    );
}
