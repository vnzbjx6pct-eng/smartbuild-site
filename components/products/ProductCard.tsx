import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '@/app/lib/types';
import { getProductImage } from '@/app/lib/imageUtils';
// Note: We might need to extend the type locally or ensure the global type has everything we need.
// For now assuming the standard Product type is sufficient or we cast the DB result.

interface ProductCardProps {
    product: any; // Using any temporarily to avoid strict type issues with joined queries until we refine types
}

export default function ProductCard({ product }: ProductCardProps) {
    // Determine image to show
    const imageUrl = getProductImage(product);
    const companyName = product.profiles?.company_name?.trim() || "";

    return (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full group">
            {/* Image */}
            <div className="relative aspect-square bg-slate-50 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                />

                {/* Partner Badge */}
                {companyName && (
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-slate-600 shadow-sm">
                        {companyName}
                    </div>
                )}
                <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full shadow-sm">
                    Võrdle hindu
                </span>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                <div className="text-xs text-slate-500 mb-1">{product.category || 'Määramata'}</div>
                <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 min-h-[2.5em]">
                    <Link href={`/products/${product.id}`} className="hover:text-emerald-600 transition-colors">
                        {product.name}
                    </Link>
                </h3>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                    <div>
                        <div className="text-lg font-bold text-slate-900">
                            {Number(product.price).toFixed(2)} €
                        </div>
                        <div className="text-xs text-slate-500">
                            {product.unit ? `Hind / ${product.unit}` : 'Hind'}
                        </div>
                    </div>

                    <Link
                        href={`/products/${product.id}`}
                        className="w-10 h-10 bg-slate-100 text-slate-900 rounded-lg flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                        aria-label="Vaata toodet"
                    >
                        <ShoppingCart size={20} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
