"use client";

import { useEffect } from "react";
import { track } from "@/app/lib/analytics";
import ProductCard from "@/components/products/ProductCard";
import Link from "next/link";

export default function ClientCatalog({ products }: { products: any[] }) {
    useEffect(() => {
        track("view_catalog");
    }, []);

    return (
        <div className="bg-slate-950 min-h-screen text-slate-100">
            <div className="container mx-auto px-4 py-12">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-slate-800 text-slate-200 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-2 border border-slate-700">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            Piirkond: Pärnu (Vaikimisi)
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-100">Ehitusmaterjalide hinnad</h1>
                        <p className="text-slate-400 mt-2 max-w-2xl">
                            SmartBuild ei müü kaupu – me aitame leida parima hinna Eesti ehituspoodides.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button className="bg-slate-800 border border-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
                            Filtreeri
                        </button>
                        <button className="bg-orange-500 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors shadow-sm">
                            Ostukorv
                        </button>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </div>
    );
}
