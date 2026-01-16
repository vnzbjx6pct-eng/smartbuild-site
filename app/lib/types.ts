export interface Product {
    id: string; // or number, depending on DB, usually number/string
    name: string;
    category: string;
    store: string;
    price: number;
    url: string;
    created_at?: string;
    image_url?: string; // Optional if not in requirements but good to have
}
