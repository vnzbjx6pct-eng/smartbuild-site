import { createClient } from "@/app/lib/supabaseServer";
import { notFound } from "next/navigation";
import { PartnerInfo } from "@/app/components/partners/PartnerInfo";
import { PartnerProducts } from "@/app/components/partners/PartnerProducts";
import type { PartnerProfile } from "@/app/lib/types";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface PartnerPageProps {
    params: {
        slug: string;
    }
}

// 1. Generate Metadata
export async function generateMetadata({ params }: PartnerPageProps) {
    const supabase = await createClient();
    const { data: partner } = await supabase
        .from('profiles')
        .select('company_name, description')
        .eq('company_slug', params.slug)
        .eq('role', 'partner')
        .single();

    if (!partner) return { title: 'Partner Not Found' };

    return {
        title: `${partner.company_name} | SmartBuild`,
        description: partner.description || `Browse products from ${partner.company_name} on SmartBuild.`
    };
}

// 2. Page Component
export default async function PartnerDetailPage({ params }: PartnerPageProps) {
    const supabase = await createClient();

    // Fetch Partner and their products
    const { data: partner, error } = await supabase
        .from('profiles')
        .select(`
            *,
            products!products_partner_id_fkey (
                id,
                name,
                price,
                image_url,
                category,
                stock,
                created_at
            )
        `)
        .eq('company_slug', params.slug)
        .eq('role', 'partner')
        .single();

    if (error || !partner) {
        console.error("Partner not found:", error);
        notFound();
    }

    // Type casting because the join return type is dynamic
    const typedPartner = partner as PartnerProfile & { products: any[] };
    const products = typedPartner.products || [];

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-20">
            <div className="container mx-auto px-4">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-8 overflow-x-auto whitespace-nowrap">
                    <Link href="/" className="hover:text-slate-900">Home</Link>
                    <ChevronRight size={14} />
                    <Link href="/partners" className="hover:text-slate-900">Partners</Link>
                    <ChevronRight size={14} />
                    <span className="font-medium text-slate-900">{typedPartner.company_name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Column: Info */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <PartnerInfo partner={typedPartner} />
                        </div>
                    </div>

                    {/* Right Column: Products */}
                    <div className="lg:col-span-3">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">{products.length} Products Available</h2>
                        </div>
                        <PartnerProducts products={products} />
                    </div>
                </div>

            </div>
        </div>
    );
}
