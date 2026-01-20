import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { PartnerCard } from "@/app/components/partners/PartnerCard";
import type { PartnerProfile } from "@/app/lib/types";
import { Store as StoreIcon, Search } from "lucide-react";

export const revalidate = 3600; // Revalidate every hour

export default async function PartnersListPage() {
    const supabase = await createSupabaseServerClient();

    // Fetch partners with product count
    const { data: partners, error } = await supabase
        .from('profiles')
        .select(`
            *,
            products:products!products_partner_id_fkey(count)
        `)
        .eq('role', 'partner')
        .order('company_name');

    if (error) {
        console.error("Error fetching partners:", error);
    }

    // Process data to match PartnerCard props
    const processedPartners = (partners || []).map((p: PartnerProfile & { products?: Array<{ count?: number }> }) => ({
        ...p,
        product_count: p.products?.[0]?.count || 0,
        rating: 4.8 // Mock rating for now
    })) as (PartnerProfile & { product_count: number; rating: number })[];

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-20">
            <div className="container mx-auto px-4">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-medium mb-4">
                            <StoreIcon size={14} />
                            <span>Official Partners</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Our Partner Stores</h1>
                        <p className="text-slate-500 max-w-xl">
                            Browse our verified partners offering quality construction materials.
                            Compare prices and find the best deals near you.
                        </p>
                    </div>

                    {/* Simple Search - Could be client component for interactivity, keeping simple logic here for now */}
                    <div className="w-full md:w-72 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Find a store..."
                            className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Grid */}
                {processedPartners.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {processedPartners.map(partner => (
                            <PartnerCard key={partner.id} partner={partner} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <StoreIcon className="text-slate-400" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No partners found</h3>
                        <p className="text-slate-500">Check back later as we onboard more stores.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
