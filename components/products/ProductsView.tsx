"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import ProductList from "./ProductList";
import type { Product } from "@/app/lib/types";

export default function ProductsView({ initialProducts }: { initialProducts: Product[] }) {
    const { t } = useLanguage();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-white">{t.products.title}</h1>
            <ProductList initialProducts={initialProducts} />
        </div>
    );
}
