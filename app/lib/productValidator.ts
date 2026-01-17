import { Product } from "./types";

export type ValidationStatus = "ACTIVE" | "DRAFT" | "REJECTED";

export interface ValidationResult {
    status: ValidationStatus;
    reasons: string[];
    qualityScore: number; // 0-100
}

/**
 * Validates a product name for clarity and specificity.
 * Rejects generic names like "Item 123" or "Material".
 */
function validateName(name: string): { isValid: boolean; reason?: string } {
    if (!name || name.length < 5) return { isValid: false, reason: "NAME_TOO_SHORT" };

    const genericTerms = ["item", "product", "material", "thing", "stuff"];
    const lowerName = name.toLowerCase();

    if (genericTerms.some(term => lowerName === term)) {
        return { isValid: false, reason: "NAME_TOO_GENERIC" };
    }

    // Check for spec indicators (numbers usually indicate dimensions/weight)
    const hasSpec = /\d+/.test(name);
    if (!hasSpec) {
        return { isValid: false, reason: "NAME_MISSING_SPEC" };
    }

    return { isValid: true };
}

/**
 * Validates product image quality and relevance.
 * Enforces "Real Product" or "Clean Generic" rule.
 */
function validateImage(image: string): { isValid: boolean; reason?: string } {
    if (!image) return { isValid: false, reason: "IMAGE_MISSING" };

    // In a real app, this would check resolution, aspect ratio, etc.
    // For now, we enforce that it's a local asset from our curated folder
    // OR a whitelisted reliable source.

    const isLocalAsset = image.startsWith("/images/products/") || image.startsWith("/images/categories/");
    const isUnsplash = image.includes("unsplash.com"); // Legacy/Fallback support, might flag as warning in strict mode

    if (!isLocalAsset && !isUnsplash) {
        return { isValid: false, reason: "IMAGE_SOURCE_UNTRUSTED" };
    }

    // Specific check for known placeholder filenames if any
    if (image.includes("placeholder")) {
        return { isValid: false, reason: "IMAGE_IS_PLACEHOLDER" };
    }

    return { isValid: true };
}

/**
 * Main Validator Function
 */
export function validateProduct(product: Product): ValidationResult {
    const reasons: string[] = [];
    let score = 100;

    // 1. Name Validation
    const nameCheck = validateName(product.name);
    if (!nameCheck.isValid) {
        reasons.push(nameCheck.reason!);
        score -= 50;
    }

    // 2. Image Validation
    const imageCheck = validateImage(product.image);
    if (!imageCheck.isValid) {
        reasons.push(imageCheck.reason!);
        score -= 50;
    }

    // 3. Category Check
    if (!product.category || product.category === "Uncategorized") {
        reasons.push("CATEGORY_INVALID");
        score -= 20;
    }

    // Determine Status
    let status: ValidationStatus = "ACTIVE";

    if (score < 50) {
        status = "REJECTED";
    } else if (score < 80 || reasons.length > 0) {
        status = "DRAFT"; // Needs review but technically passable (maybe name is missing spec)
    }

    // Critical Failure Override
    if (reasons.includes("IMAGE_MISSING") || reasons.includes("NAME_TOO_GENERIC")) {
        status = "REJECTED";
    }

    return { status, reasons, qualityScore: score };
}
