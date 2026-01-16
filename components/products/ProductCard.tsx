"use client";

import { useState } from "react";
import Image from "next/image";
import AddToCartButton from "./AddToCartButton";
import { Product } from "@/app/lib/mockData";
import { STORE_HOME_URL, StoreName } from "@/app/lib/stores";

export default function ProductCard({ product }: { product: Product }) {
    const [showPrices, setShowPrices] = useState(false);

    const minPrice = Math.min(...product.offers.map((o) => o.price));
    const maxPrice = Math.max(...product.offers.map((o) => o.price));

    return (
        <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full">
            {/* Top Section: Image & Basic Info */}
            <div className="p-5 flex-grow">
                <div className="aspect-[4/3] relative bg-slate-50 rounded-xl mb-4 overflow-hidden">
                    {/* Using standard img for mock external URLs, Next/Image requires domain config */}
                    <img
                        src={product.image}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-slate-900 shadow-sm border border-slate-100">
                        {product.category}
                    </div>
                </div>

                <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1">{product.name}</h3>
                <p className="text-sm text-slate-500 mb-4">Ühik: {product.unitLabel || product.unit}</p>

                <div className="flex items-center justify-between mt-auto">
                    <div>
                        <p className="text-xs text-slate-500">Hinnad alates</p>
                        <p className="text-xl font-bold text-emerald-600">{minPrice.toFixed(2)} €</p>
                    </div>

                    <button
                        onClick={() => setShowPrices(!showPrices)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${showPrices ? 'bg-slate-100 text-slate-900' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                    >
                        {showPrices ? "Peida hinnad" : "Vaata hindu"}
                    </button>
                </div>
            </div>

            {/* Expanded Section: Prices Table */}
            {showPrices && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-2 mb-4">
                        {product.offers.sort((a, b) => a.price - b.price).map((offer, idx) => {
                            const isBest = offer.price === minPrice;
                            const isExpensive = offer.price === maxPrice && product.offers.length > 1;

                            console.log(offer.storeName, STORE_HOME_URL);
                            const url = STORE_HOME_URL[offer.storeName as StoreName];

                            return (
                                <div key={idx} className={`flex items-center justify-between p-3 rounded-lg text-sm ${isBest ? 'bg-emerald-50/50 ring-1 ring-emerald-100' : ''}`}>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${offer.logoColor}`} />
                                        <span className={`font-medium ${isExpensive ? 'text-slate-400' : 'text-slate-700'}`}>{offer.storeName}</span>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className={`font-semibold ${isBest ? 'text-emerald-700' : isExpensive ? 'text-slate-400' : 'text-slate-900'}`}>
                                                {offer.price.toFixed(2)} €
                                            </div>
                                            <div className="text-[10px] leading-none text-slate-500">
                                                {offer.availability}
                                            </div>
                                        </div>

                                        {/* Visit Store Link */}
                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-slate-400 hover:text-slate-900 transition-colors p-1"
                                            title="Vaata poodi"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <AddToCartButton product={product} />
                </div>
            )}
        </div>
    );
}
