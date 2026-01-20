import { getPartnerProducts } from "@/app/actions/partner";
import ProductTable from "@/components/partner/ProductTable";
import { Toaster } from "react-hot-toast";

export const dynamic = 'force-dynamic';

export default async function PartnerProductsPage() {
    const { data: products, error } = await getPartnerProducts();

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    Viga toodete laadimisel: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Toaster position="top-right" />

            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Tooted</h1>
                    <p className="text-slate-500">Halda oma poe sortimenti, hindu ja laoseisu.</p>
                </div>
            </div>

            <ProductTable initialProducts={products || []} />
        </div>
    );
}
