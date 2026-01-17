import ProductsView from "@/components/products/ProductsView";
import { PRODUCTS } from "@/app/lib/mockData";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Ehitusmaterjalid — Hinnad ja pakkumised",
    description: "Lai valik ehitusmaterjale. Võrdle hindu erinevates poodides ja leia soodsaim. Kipsplaadid, soojustus, segu jm.",
};

// Filter Quality Gated products
const validProducts = PRODUCTS.filter(p => p.status === "ACTIVE" || !p.status);

export default function ProductsPage() {
    return (
        <div className="bg-pattern-subtle min-h-screen">
            <ProductsView initialProducts={validProducts} />
        </div>
    );
}