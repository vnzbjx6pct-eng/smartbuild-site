export interface Profile {
    id: string;
    role?: string;
    company_name: string;
    company_slug?: string;
    city?: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image_url: string | null;
    stock: number;
    unit: string;
    is_active: boolean;
    partner_id: string;
    sku?: string;
    created_at: string;
    profiles?: Profile; // Relation
}

export interface ProductFilterParams {
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
    category?: string;
}

export interface CartItem {
    id: string;
    product_id: string;
    quantity: number;
    product: Product; // We'll join this
}

export interface Cart {
    items: CartItem[];
    total: number;
    itemsCount: number;
}
