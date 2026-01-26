'use client';

import { useState } from "react";
import type { Product } from "@/app/lib/types";
import { Search } from "lucide-react";
import { getProductImage } from "@/app/lib/imageUtils";

interface PartnerProductsProps {
    products: any[]; // Using any[] temporarily as the join structure might differ slightly from strict Product type
}

export function PartnerProducts({ products }: PartnerProductsProps) {
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    // Extract categories
    const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

    const filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    <button
                        onClick={() => setCategoryFilter("all")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${categoryFilter === "all" ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
                    >
                        All Products
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${categoryFilter === cat ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(product => (
                    // Mapping partial product data to the card, or using a simple card if ProductCard is too complex
                    // Ideally we should map to the standard Product type, but for now passing as is if compatible
                    <div key={product.id} className="group bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all">
                        <div className="aspect-square bg-slate-50 rounded-xl mb-4 overflow-hidden relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={getProductImage(product)}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        <div>
                            <div className="text-xs text-slate-500 mb-1">{product.category}</div>
                            <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 min-h-[2.5em]">{product.name}</h3>
                            <div className="flex items-center justify-between">
                                <div className="font-bold text-lg">€{product.price}</div>
                                {product.stock > 0 ? (
                                    <span className="text-xs font-medium bg-green-50 text-green-700 px-2 py-1 rounded-full">In Stock</span>
                                ) : (
                                    <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-1 rounded-full">Out of Stock</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-slate-500">No products found matching your search.</p>
                </div>
            )}
        </div>
    );
}
