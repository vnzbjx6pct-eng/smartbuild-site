"use client";

import { useState } from "react";
import Image from "next/image";
import AddToCartButton from "./AddToCartButton";
import { Product } from "@/app/lib/types";
import { STORE_HOME_URL, StoreName } from "@/app/lib/stores";
import { getProductImage } from "@/app/lib/imageUtils";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function ProductCard({ product }: { product: Product }) {
    const { t } = useLanguage();
    const [showPrices, setShowPrices] = useState(false);

    // Monetization / Partner Logic
    const { getPartnerConfig } = require("@/app/lib/partners");

    // Sort offers so we know the best one
    const sortedOffers = [...product.offers].sort((a, b) => a.price - b.price);
    const bestOffer = sortedOffers[0];

    const partnerConfig = bestOffer ? getPartnerConfig(bestOffer.storeName) : null;
    const isPartner = partnerConfig?.tier === "premium" || partnerConfig?.tier === "partner";

    const minPrice = Math.min(...product.offers.map((o) => o.price));

    // Resolve Image (Hybrid Strategy: Real > Fallback)
    const hasSpecificImage = product.image && !product.image.includes("unsplash");
    // Ensure we use the helper to normalize path
    const initialImage = getProductImage(hasSpecificImage ? product.image : undefined);
    const [imgSrc, setImgSrc] = useState(initialImage);

    // I18N Data Layer Logic
    const categoryName = (t as any).categories?.[product.categoryKey] || product.category;
    const genericName = (t as any).prod_generics?.[product.genericNameKey];

    // Construct Display Name: "GenericName Brand Spec" (e.g. "Kipsplaat Gyproc GN 13")
    // If genericName exists, use it. Otherwise fall back to legacy product.name
    const displayName = genericName
        ? `${genericName} ${product.brand || ""} ${product.specification || ""}`.trim().replace(/\s+/g, " ")
        : product.name;

    const unitName = (t as any).units?.[product.unitKey || ""] || product.unit;

    return (
        <div className={`group bg-[#1e293b] rounded-2xl border transition-all overflow-hidden flex flex-col h-full ${isPartner ? 'border-emerald-500/30 shadow-lg shadow-emerald-900/20' : 'border-slate-700 shadow-lg hover:border-slate-600'}`}>
            {/* Top Section: Image & Basic Info */}
            <div className="p-5 flex-grow">
                {/* Badge */}
                <div className="flex justify-between items-start mb-3">
                    {isPartner ? (
                        <div title="See pood vastab päringutele prioriteetselt" className="bg-emerald-900/50 text-emerald-400 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1 cursor-help">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.602 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            Partner
                        </div>
                    ) : (
                        <div className="bg-slate-700 text-slate-300 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider border border-slate-600">
                            {categoryName}
                        </div>
                    )}
                </div>

                <div className="aspect-[4/3] relative bg-slate-900 rounded-xl mb-4 overflow-hidden border border-slate-700/50">
                    <img
                        src={imgSrc}
                        alt={displayName}
                        onError={() => setImgSrc("/images/products/placeholder.png")}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />
                    {/* Gradient Overlay for Text Readability if needed, though we have cards below */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent pointer-events-none" />
                </div>

                <h3 className="font-bold text-slate-100 text-lg leading-tight mb-1">{displayName}</h3>
                <p className="text-sm text-slate-400 mb-4">{t.products.unit_label}: {product.unitLabel || unitName}</p>

                <div className="flex items-center justify-between mt-auto">
                    <div>
                        <p className="text-xs text-slate-500">{t.products.price_from}</p>
                        <p className="text-xl font-bold text-emerald-400">{minPrice.toFixed(2)} €</p>
                    </div>

                    <button
                        onClick={() => setShowPrices(!showPrices)}
                        className={`w-full md:w-auto px-6 py-3 md:py-2 rounded-xl text-sm font-bold transition-colors shadow-sm ${showPrices ? 'bg-slate-700 text-white' : 'bg-white text-slate-900 hover:bg-slate-200'}`}
                    >
                        {showPrices ? t.products.hide_prices : t.products.view_prices}
                    </button>
                </div>
            </div>

            {/* Expanded Section: Prices Table */}
            {showPrices && (
                <div className="border-t border-slate-700 bg-slate-800/50 p-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-2 mb-4">
                        {sortedOffers.map((offer, idx) => {
                            const isBest = offer.price === minPrice;

                            // Affiliate / Partner Logic
                            const offerPartnerConfig = getPartnerConfig(offer.storeName);
                            // Base URL from store map
                            const baseUrl = STORE_HOME_URL[offer.storeName as StoreName] || "#";
                            // Append affiliate param if exists
                            const finalUrl = offerPartnerConfig.affiliateParam
                                ? `${baseUrl}${offerPartnerConfig.affiliateParam}`
                                : baseUrl;

                            return (
                                <div key={idx} className={`flex items-center justify-between p-3 rounded-lg text-sm ${isBest ? 'bg-emerald-900/30 ring-1 ring-emerald-500/50' : 'bg-slate-700/30'}`}>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${offer.logoColor}`} />
                                        <span className={`font-medium ${offerPartnerConfig.tier === 'premium' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>{offer.storeName}</span>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className={`font-semibold ${isBest ? 'text-emerald-400' : 'text-slate-200'}`}>
                                                {offer.price.toFixed(2)} €
                                            </div>
                                        </div>

                                        {/* Visit Store Link */}
                                        <a
                                            href={finalUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-medium text-slate-500 hover:text-white underline decoration-slate-600 hover:decoration-slate-400 transition-all flex items-center gap-1"
                                            title={t.products.go_to_store}
                                        >
                                            {t.products.go_to_store}
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <AddToCartButton product={product} />
                    <p className="text-[10px] text-center text-slate-500 mt-2">
                        {t.products.tip_bulk}
                    </p>
                </div>
            )}
        </div>
    );
}
