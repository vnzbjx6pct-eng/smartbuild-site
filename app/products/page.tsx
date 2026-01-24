import { createSupabaseServerClient } from '@/app/lib/supabase/server';
import ProductGrid from "@/app/components/products/ProductGrid";
import ProductFilters from "@/app/components/products/ProductFilters";
import Pagination from "@/app/components/products/Pagination";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Ehitusmaterjalid — SmartBuild",
    description: "Leia parimad ehitusmaterjalid erinevatelt müüjatelt.",
};

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedParams = await searchParams;

    const page = Number(resolvedParams.page) || 1;
    const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : '';
    const minPrice = typeof resolvedParams.minPrice === 'string' ? resolvedParams.minPrice : '';
    const maxPrice = typeof resolvedParams.maxPrice === 'string' ? resolvedParams.maxPrice : '';
    const sort = typeof resolvedParams.sort === 'string' ? resolvedParams.sort : 'newest';

    const limit = 24;
    const offset = (page - 1) * limit;

    const supabase = await createSupabaseServerClient();

    let query = supabase
        .from('products')
        .select(`
            *,
            profiles!products_partner_id_fkey (
                company_name,
                company_slug,
                city
            )
        `, { count: 'exact' })
        .eq('is_active', true);

    // Apply filters
    if (search) {
        query = query.ilike('name', `%${search}%`);
    }

    if (minPrice) {
        query = query.gte('price', Number(minPrice));
    }

    if (maxPrice) {
        query = query.lte('price', Number(maxPrice));
    }

    // Apply sorting
    switch (sort) {
        case 'price_asc':
            query = query.order('price', { ascending: true });
            break;
        case 'price_desc':
            query = query.order('price', { ascending: false });
            break;
        case 'name_asc':
            query = query.order('name', { ascending: true });
            break;
        default: // 'newest'
            query = query.order('created_at', { ascending: false });
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: products, error, count } = await query;

    if (error) {
        console.error("Error fetching products:", error);
        return <div className="p-8 text-center text-red-500">Viga toodete laadimisel.</div>;
    }

    const totalPages = count ? Math.ceil(count / limit) : 0;

    return (
        <div className="min-h-screen bg-slate-900 py-8 text-slate-100">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="flex flex-col gap-8">
                    {/* Header & Filters */}
                    <div>
                        <h1 className="text-3xl font-bold text-slate-100 mb-2">Kõik tooted</h1>
                        <p className="text-slate-400 mb-6">Leia vajalikud materjalid meie partnerite valikust.</p>
                        <ProductFilters />
                    </div>

                    {/* Results */}

                    <ProductGrid products={products || []} />

                    {/* Pagination */}
                    <Pagination currentPage={page} totalPages={totalPages} />
                </div>
            </div>
        </div>
    );
}