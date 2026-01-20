import ProductCard from './ProductCard';

interface ProductGridProps {
    products: any[];
}

export default function ProductGrid({ products }: ProductGridProps) {
    if (!products || products.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                <p className="text-slate-500 text-lg">Tooteid ei leitud.</p>
                <p className="text-slate-400 text-sm">Proovi muuta filtreid või otsingut.</p>
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
