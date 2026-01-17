export function getProductImage(path?: string): string {
    if (!path) return "/images/products/placeholder.png";
    // We could add logic here to check if file exists if we had server-side access, 
    // but on client we rely on onError.
    // However, to satisfy "If product has a canonical image URL => use it", we just return it.
    // The placeholder fallback happens in the component onError or if path is null/empty.
    // We can also normalize path here.
    if (path.startsWith("/")) return path;
    return `/${path}`;
}

export const PLACEHOLDER_IMAGE = "/images/products/placeholder.png";
