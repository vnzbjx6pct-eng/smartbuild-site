type ProductImageSource = {
    image_url?: string | null;
    image?: string | null;
    category?: string | null;
    categoryKey?: string | null;
    subcategoryKey?: string | null;
    genericNameKey?: string | null;
    type?: string | null;
    material_type?: string | null;
};

const PRODUCT_PLACEHOLDERS = {
    kipsplaat: "/images/placeholders/drywall.jpg",
    cement: "/images/placeholders/cement.jpg",
    wood: "/images/placeholders/wood.jpg",
    default: "/images/placeholders/material.jpg",
} as const;

const normalizeImagePath = (path: string) => {
    const trimmed = path.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
    if (trimmed.startsWith("/")) return trimmed;
    return `/${trimmed}`;
};

const normalizeCategory = (product?: ProductImageSource | null) => {
    const raw = product?.category
        || product?.categoryKey
        || product?.subcategoryKey
        || product?.genericNameKey
        || product?.type
        || product?.material_type
        || "";
    return String(raw).toLowerCase();
};

export function getProductImage(product?: ProductImageSource | null): string {
    const directUrl = product?.image_url || product?.image;
    if (typeof directUrl === "string" && directUrl.trim().length > 0) {
        return normalizeImagePath(directUrl);
    }

    const category = normalizeCategory(product);
    if (category.includes("kips") || category.includes("drywall") || category.includes("gypsum")) {
        return PRODUCT_PLACEHOLDERS.kipsplaat;
    }
    if (category.includes("cement") || category.includes("tsement")) {
        return PRODUCT_PLACEHOLDERS.cement;
    }
    if (category.includes("wood") || category.includes("puit") || category.includes("timber")) {
        return PRODUCT_PLACEHOLDERS.wood;
    }
    return PRODUCT_PLACEHOLDERS.default;
}

export const PLACEHOLDER_IMAGE = PRODUCT_PLACEHOLDERS.default;
