'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';

export default function ProductFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            updateParams({ search });
        }, 500);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const updateParams = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === '') {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        // Reset page on filter change
        params.set('page', '1');
        router.push(`?${params.toString()}`);
    };

    const handleApplyFilters = () => {
        updateParams({ minPrice, maxPrice });
        setIsMobileFiltersOpen(false);
    };

    const handleReset = () => {
        setSearch('');
        setMinPrice('');
        setMaxPrice('');
        setSort('newest');
        router.push('/products');
        setIsMobileFiltersOpen(false);
    };

    return (
        <div className="space-y-6">
            {/* Search and Sort Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Otsi toodet..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <button
                        onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                        className="md:hidden flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium"
                    >
                        <SlidersHorizontal size={20} />
                        Filtrid
                    </button>

                    <select
                        value={sort}
                        onChange={(e) => {
                            setSort(e.target.value);
                            updateParams({ sort: e.target.value });
                        }}
                        className="flex-1 md:w-48 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 cursor-pointer bg-white"
                    >
                        <option value="newest">Uuemad eespool</option>
                        <option value="price_asc">Hind: odavamad enne</option>
                        <option value="price_desc">Hind: kallimad enne</option>
                        <option value="name_asc">Nimi: A-Z</option>
                    </select>
                </div>
            </div>

            {/* Filters Area (Desktop & Mobile Modal) */}
            <div className={`
                ${isMobileFiltersOpen ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden md:block'} 
                md:relative md:bg-transparent md:p-0 md:inset-auto md:z-auto
            `}>
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="md:hidden flex justify-between w-full mb-4">
                        <h3 className="font-bold text-lg">Filtrid</h3>
                        <button onClick={() => setIsMobileFiltersOpen(false)}>
                            <X size={24} />
                        </button>
                    </div>

                    {/* Price Range */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto">
                        <span className="font-medium text-slate-700 whitespace-nowrap">Hind (€):</span>
                        <div className="flex items-center gap-2 w-full">
                            <input
                                type="number"
                                placeholder="Min"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="w-full md:w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            />
                            <span className="text-slate-400">-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="w-full md:w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 w-full md:w-auto ml-auto">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                        >
                            Tühista
                        </button>
                        <button
                            onClick={handleApplyFilters}
                            className="px-6 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                        >
                            Rakenda
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
