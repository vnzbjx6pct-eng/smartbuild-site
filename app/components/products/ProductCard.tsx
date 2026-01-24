import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '@/app/types';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const companyName = product.profiles?.company_name?.trim() || "";

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:shadow-lg transition-all group h-full flex flex-col">
            <Link href={`/products/${product.id}`} className="block relative aspect-square bg-slate-900/60 overflow-hidden">
                {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <span className="text-sm">Pilt puudub</span>
                    </div>
                )}
                <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full shadow-sm">
                    Võrdle hindu
                </span>
            </Link>

            <div className="p-4 flex flex-col flex-grow">
                <div className="mb-2">
                    <span className="text-xs text-slate-300 bg-slate-700/70 px-2 py-0.5 rounded-full">
                        {product.category}
                    </span>
                </div>

                <Link href={`/products/${product.id}`} className="block mb-2 flex-grow">
                    <h3 className="font-bold text-slate-100 line-clamp-2 group-hover:text-emerald-300 transition-colors">
                        {product.name}
                    </h3>
                </Link>

                {product.profiles && (
                    <div className="text-xs text-slate-400 mb-3">
                        Müüja: <span className="font-medium text-slate-200">{companyName || "Tundmatu"}</span>
                    </div>
                )}

                <div className="mt-auto pt-3 border-t border-slate-700 flex items-center justify-between">
                    <div>
                        <div className="font-bold text-lg text-slate-100">
                            {Number(product.price).toFixed(2)} €
                        </div>
                        <div className="text-xs text-slate-400">
                            / {product.unit}
                        </div>
                    </div>

                    <Link
                        href={`/products/${product.id}`}
                        className="bg-emerald-600 text-white p-2.5 rounded-lg hover:bg-emerald-500 transition-colors"
                    >
                        <ShoppingCart size={18} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
