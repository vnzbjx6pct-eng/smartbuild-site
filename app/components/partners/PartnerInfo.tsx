import type { PartnerProfile } from "@/app/lib/types";
import { Building2, Mail, MapPin, Phone, Globe } from "lucide-react";

interface PartnerInfoProps {
    partner: PartnerProfile;
}

export function PartnerInfo({ partner }: PartnerInfoProps) {
    const formatAddress = (addr: PartnerProfile['address']) => {
        if (!addr) return null;
        const parts = [addr.street, addr.city, addr.postal_code, addr.country].filter(Boolean);
        return parts.join(', ');
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Cover / Header */}
            <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-900 relative">
                <div className="absolute -bottom-10 left-8">
                    <div className="w-24 h-24 rounded-2xl bg-white border-2 border-white shadow-md flex items-center justify-center overflow-hidden">
                        {partner.logo_url ? (
                            <img src={partner.logo_url} alt={partner.company_name} className="w-full h-full object-contain p-2" />
                        ) : (
                            <Building2 className="text-slate-300" size={40} />
                        )}
                    </div>
                </div>
            </div>

            <div className="pt-12 pb-6 px-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">{partner.company_name}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-6">
                    {partner.address?.city && (
                        <div className="flex items-center gap-1.5">
                            <MapPin size={16} />
                            {partner.address.city}
                        </div>
                    )}
                    {partner.contact_email && (
                        <a href={`mailto:${partner.contact_email}`} className="flex items-center gap-1.5 hover:text-orange-600 transition-colors">
                            <Mail size={16} />
                            {partner.contact_email}
                        </a>
                    )}
                    {partner.phone && (
                        <div className="flex items-center gap-1.5">
                            <Phone size={16} />
                            {partner.phone}
                        </div>
                    )}
                </div>

                <div className="space-y-4 border-t border-slate-100 pt-6">
                    <div>
                        <h3 className="font-semibold text-slate-900 mb-2">About Us</h3>
                        <p className="text-slate-600 leading-relaxed">
                            {partner.description || "No description available."}
                        </p>
                    </div>

                    {partner.address && (
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-2">Location</h3>
                            <p className="text-slate-600">{formatAddress(partner.address)}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
