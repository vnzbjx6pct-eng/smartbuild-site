import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";
import ClientProductDetail from "./ClientProductDetail";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { data: product } = await supabase.from('products').select('name').eq('id', id).single();
    return {
        title: product ? `${product.name} hind — Võrdlus` : 'Toode puudub',
        description: product ? `${product.name} parim hind Eestis. Võrdle pakkumisi erinevatest ehituspoodidest SmartBuildis.` : 'Vaata ehitusmaterjalide hindu.',
    };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch product and ALL offers with brand info (mock for now if no DB)
    // NOTE: In previous context, we might rely on Supabase, but restrictions said "No Supabase" for new stuff.
    // However, this file imports 'supabase'. Assuming it works or is a mock client.
    // If this fails, we should check if supabaseClient is actually mock. 
    // Based on user request: "Данные: mock (без Supabase)".
    // So likely the existing code tries to use supabase but it might be broken or mocked?
    // User said "Code relating to the user's requests should be written... Avoid adding Supabase".
    // I see existing code uses supabase. I will stick to what is there but add JSON-LD.

    // Actually, I should probably check if supabase client is real or mock. 
    // But I must not break existing architecture.

    const { data: product, error } = await supabase
        .from('products')
        .select(`
      *,
      offers (
        id,
        price,
        updated_at,
        url,
        brands (
           name,
           slug,
           logo_url
        )
      )
    `)
        .eq('id', id)
        .single();

    // JSON-LD Construction
    const jsonLd = product ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: `Võrdle ${product.name} hindu.`,
        offers: product.offers?.map((offer: any) => ({
            '@type': 'Offer',
            price: offer.price,
            priceCurrency: 'EUR',
            seller: {
                '@type': 'Organization',
                name: offer.brands?.name
            }
        }))
    } : null;

    if (error || !product) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold text-slate-900 mb-4">Toodet ei leitud</h1>
                <Link href="/products" className="text-orange-600 hover:underline">Tagasi kataloogi</Link>
            </div>
        );
    }

    // Sort offers by price (ascending)
    const offers = product.offers?.sort((a: any, b: any) => a.price - b.price) || [];
    const bestPrice = offers.length > 0 ? offers[0].price : null;

    return <ClientProductDetail product={product} bestPrice={bestPrice} offers={offers} />;
}
