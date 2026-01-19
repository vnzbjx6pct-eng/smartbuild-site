"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";
import EmptyState from "./EmptyState";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { getTranslatedProduct } from "@/app/lib/i18n/productUtils";
import type { Product } from "@/app/lib/types";

interface ProductListProps {
    initialProducts: Product[];
}

export default function ProductList({ initialProducts }: ProductListProps) {
    const searchParams = useSearchParams();
    const { t } = useLanguage();
    const query = searchParams.get("q")?.toLowerCase();

    const filteredProducts = useMemo(() => {
        if (!query) return initialProducts;

        return initialProducts.filter(p => {
            const { displayName, categoryName } = getTranslatedProduct(p, t);
            // Search in translated name, original name, translated category, original category
            return displayName.toLowerCase().includes(query) ||
                p.name.toLowerCase().includes(query) ||
                (categoryName && categoryName.toLowerCase().includes(query)) ||
                (p.category && p.category.toLowerCase().includes(query));
        });
    }, [initialProducts, query, t]);

    if (filteredProducts.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
