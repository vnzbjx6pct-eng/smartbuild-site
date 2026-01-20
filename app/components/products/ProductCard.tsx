import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '@/app/types';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group h-full flex flex-col">
            <Link href={`/products/${product.id}`} className="block relative aspect-square bg-slate-50 overflow-hidden">
                {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <span className="text-sm">Pilt puudub</span>
                    </div>
                )}
            </Link>

            <div className="p-4 flex flex-col flex-grow">
                <div className="mb-2">
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {product.category}
                    </span>
                </div>

                <Link href={`/products/${product.id}`} className="block mb-2 flex-grow">
                    <h3 className="font-bold text-slate-900 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                        {product.name}
                    </h3>
                </Link>

                {product.profiles && (
                    <div className="text-xs text-slate-500 mb-3">
                        Müüja: <span className="font-medium text-slate-700">{product.profiles.company_name}</span>
                    </div>
                )}

                <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                        <div className="font-bold text-lg text-slate-900">
                            {Number(product.price).toFixed(2)} €
                        </div>
                        <div className="text-xs text-slate-500">
                            / {product.unit}
                        </div>
                    </div>

                    <Link
                        href={`/products/${product.id}`}
                        className="bg-slate-900 text-white p-2.5 rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                        <ShoppingCart size={18} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
