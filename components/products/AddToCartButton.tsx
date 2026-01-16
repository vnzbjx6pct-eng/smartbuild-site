"use client";

import { useCart } from "@/components/cart/CartProvider";
import { useState } from "react";

type ProductProps = {
    id: string;
    name: string;
    category: string;
    unit: string;
    image: string;
    offers: any[];
};

export default function AddToCartButton({ product }: { product: ProductProps }) {
    const { addItem } = useCart();
    const [added, setAdded] = useState(false);

    const handleAdd = () => {
        addItem(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <button
            onClick={handleAdd}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${added
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
        >
            {added ? "Lisatud! ✓" : "Lisa ostukorvi"}
        </button>
    );
}
