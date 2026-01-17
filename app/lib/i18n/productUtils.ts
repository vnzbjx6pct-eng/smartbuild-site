import { Product } from "@/app/lib/types";

export function getTranslatedProduct(product: Product, t: any) {
    const categoryName = t.categories?.[product.categoryKey] || product.category;
    const genericName = t.prod_generics?.[product.genericNameKey];

    const displayName = genericName
        ? `${genericName} ${product.brand || ""} ${product.specification || ""}`.trim().replace(/\s+/g, " ")
        : product.name;

    const unitName = t.units?.[product.unitKey || ""] || product.unit;

    return {
        displayName,
        categoryName,
        unitName
    };
}
