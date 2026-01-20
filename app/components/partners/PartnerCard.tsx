import Link from "next/link";
import { Building2, MapPin, Package, Star } from "lucide-react";
import type { PartnerProfile } from "@/app/lib/types";

interface PartnerCardProps {
    partner: PartnerProfile & {
        product_count?: number; // Optional count from join or aggregation
        rating?: number; // Optional placeholder
    };
}

export function PartnerCard({ partner }: PartnerCardProps) {
    return (
        <Link
            href={`/partners/${partner.company_slug}`}
            className="group bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md hover:border-orange-200 transition-all flex flex-col h-full"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                    {partner.logo_url ? (
                        <img src={partner.logo_url} alt={partner.company_name} className="w-full h-full object-contain p-2" />
                    ) : (
                        <Building2 className="text-slate-300" size={32} />
                    )}
                </div>
                {partner.rating && (
                    <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg">
                        <Star className="text-orange-500 fill-orange-500" size={14} />
                        <span className="text-xs font-bold text-orange-700">{partner.rating.toFixed(1)}</span>
                    </div>
                )}
            </div>

            <div className="mb-4 flex-1">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                    {partner.company_name}
                </h3>
                {partner.address?.city && (
                    <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-1">
                        <MapPin size={14} />
                        <span>{partner.address.city}</span>
                    </div>
                )}
                <p className="text-slate-500 text-sm mt-3 line-clamp-2">
                    {partner.description || "Trusted partner providing quality construction materials."}
                </p>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-slate-50 text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                    <Package size={16} className="text-slate-400" />
                    <span className="font-medium text-slate-700">{partner.product_count || 0}</span> products
                </div>
            </div>
        </Link>
    );
}
