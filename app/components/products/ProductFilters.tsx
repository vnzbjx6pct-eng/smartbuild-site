"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

export default function ProductFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Local state for debounced inputs
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
    const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
    const [sort, setSort] = useState(searchParams.get("sort") || "newest");
    const [isOpen, setIsOpen] = useState(false);

    // Apply filters function
    const applyFilters = () => {
        const params = new URLSearchParams();

        if (search) params.set("search", search);
        if (minPrice) params.set("minPrice", minPrice);
        if (maxPrice) params.set("maxPrice", maxPrice);
        if (sort && sort !== 'newest') params.set("sort", sort);

        // Reset page when filtering
        params.set("page", "1");

        router.push(`/products?${params.toString()}`);
    };

    // Auto-apply search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (searchParams.get("search") || "")) {
                const params = new URLSearchParams(searchParams.toString());
                if (search) {
                    params.set("search", search);
                } else {
                    params.delete("search");
                }
                params.set("page", "1");
                router.push(`/products?${params.toString()}`);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search, router, searchParams]);

    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 mb-8 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">

                {/* Search */}
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Otsi tooteid..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>

                {/* Mobile Filter Toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium w-full justify-center"
                >
                    <SlidersHorizontal size={18} />
                    Filtrid
                </button>

                {/* Desktop Filters / Expanded Mobile */}
                <div className={`${isOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row gap-4 w-full md:w-auto items-center`}>

                    {/* Price Range */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <input
                            type="number"
                            placeholder="Min €"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="w-full md:w-24 px-3 py-2.5 rounded-lg border border-slate-200 text-sm"
                        />
                        <span className="text-slate-400">-</span>
                        <input
                            type="number"
                            placeholder="Max €"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-full md:w-24 px-3 py-2.5 rounded-lg border border-slate-200 text-sm"
                        />
                    </div>

                    {/* Sort */}
                    <select
                        value={sort}
                        onChange={(e) => {
                            setSort(e.target.value);
                            // Apply sort immediately
                            const params = new URLSearchParams(searchParams.toString());
                            params.set("sort", e.target.value);
                            router.push(`/products?${params.toString()}`);
                        }}
                        className="w-full md:w-40 px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"
                    >
                        <option value="newest">Uusimad</option>
                        <option value="price_asc">Hind: odavamad enne</option>
                        <option value="price_desc">Hind: kallimad enne</option>
                        <option value="name_asc">Nimi: A-Z</option>
                    </select>

                    <button
                        onClick={applyFilters}
                        className="w-full md:w-auto px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium text-sm hover:bg-emerald-600 transition-colors"
                    >
                        Rakenda
                    </button>
                </div>
            </div>
        </div>
    );
}
