// Dynamic translation utility - complex typing impractical
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getTranslatedProduct(product: any, t: any) {
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
