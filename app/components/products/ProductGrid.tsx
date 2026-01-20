import type { Product } from '@/app/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
    products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
    if (!products || products.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                <p className="text-slate-500">Tooteid ei leitud.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
