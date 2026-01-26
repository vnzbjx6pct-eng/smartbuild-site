"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ShoppingCart, Truck, ShieldCheck, ArrowRight } from 'lucide-react';
import { toast } from "react-hot-toast";

import type { Product } from "@/app/types";
import { useCart } from "@/app/components/cart/CartProvider";
import { getProductImage } from "@/app/lib/imageUtils";

// Helper type for similar products (subset of Product)
type SimilarProduct = Pick<Product, 'id' | 'name' | 'price' | 'image_url' | 'category'>;

type PartnerOffer = {
    id: string;
    price: number | null;
    stock: number | null;
    unit: string | null;
    store_name?: string | null;
    store?: {
        name?: string | null;
        brand_name?: string | null;
        city?: string | null;
    } | null;
};

interface ProductDetailClientProps {
    product: Product;
    partnerOffers: PartnerOffer[];
    bestOfferId: string | null;
    minPrice: number | null;
    maxPrice: number | null;
    avgPrice: number | null;
    isAvailable: boolean;
    offersErrorMessage?: string | null;
    similarProducts: SimilarProduct[];
}

export default function ProductDetailClient({ product, partnerOffers, bestOfferId, minPrice, maxPrice, avgPrice, isAvailable, offersErrorMessage, similarProducts }: ProductDetailClientProps) {
    const { addToCart } = useCart();
    const sortedOffers = [...(partnerOffers || [])].sort((a, b) => {
        const aPrice = typeof a.price === "number" ? a.price : Number.POSITIVE_INFINITY;
        const bPrice = typeof b.price === "number" ? b.price : Number.POSITIVE_INFINITY;
        return aPrice - bPrice;
    });
    const isOfferOutOfStock = (offer?: PartnerOffer | null) => Boolean(offer && offer.stock === 0);
    const bestOfferCandidate = sortedOffers.find((offer) => offer.id === bestOfferId) || sortedOffers[0] || null;
    const primaryOffer = bestOfferCandidate && isOfferOutOfStock(bestOfferCandidate)
        ? (sortedOffers.find((offer) => !isOfferOutOfStock(offer)) || bestOfferCandidate)
        : bestOfferCandidate;

    useEffect(() => {
        console.log("[product] offer debug", {
            offersLength: sortedOffers.length,
            bestOffer: primaryOffer
                ? { id: primaryOffer.id, price: primaryOffer.price, stock: primaryOffer.stock }
                : null,
            isAvailable,
        });
    }, [isAvailable, primaryOffer, sortedOffers.length]);

    if (!product) return null;

    const companyName = primaryOffer?.store?.name?.trim()
        || primaryOffer?.store?.brand_name?.trim()
        || primaryOffer?.store_name?.trim()
        || product.profiles?.company_name?.trim()
        || "";
    const imageUrl = getProductImage(product);
    const companyInitials = companyName ? companyName.substring(0, 2).toUpperCase() : "?";
    const displayPrice = typeof primaryOffer?.price === "number" ? primaryOffer.price : product.price;
    const displayUnit = primaryOffer?.unit || product.unit;
    const hasPartnerInfo = Boolean(primaryOffer?.store || primaryOffer?.store_name || product.profiles);
    const displayStockCount = typeof primaryOffer?.stock === 'number' && primaryOffer.stock > 0 ? primaryOffer.stock : null;

    const formatPrice = (value: number | null) => value === null ? "—" : `${value.toFixed(2)} €`;
    const shouldShowOffersNotice = Boolean(offersErrorMessage) || sortedOffers.length === 0;
    const isDev = process.env.NODE_ENV !== "production";
    const handleAddOffer = async (offerId?: string | null) => {
        if (!offerId) {
            toast.error("Pakkumine puudub.");
            return;
        }

        const result = await addToCart(offerId, 1, {
            silent: true,
            debug: {
                bestOfferId: primaryOffer?.id ?? null,
                bestOfferPrice: primaryOffer?.price ?? null,
                bestOfferStock: primaryOffer?.stock ?? null,
                offersLength: sortedOffers.length,
                isAvailable,
            },
        });
        if (result.success) {
            toast.success("Lisatud korvi");
            return;
        }

        if (result.error === "LOGIN_REQUIRED") {
            toast.error("Logi sisse");
            return;
        }

        if (result.error === "INVALID_OFFER") {
            toast.error("Offer puudub");
            return;
        }

        if (result.error === "ADD_TO_CART_FAILED" && isDev && result.debug?.supabaseError?.message) {
            toast.error(result.debug.supabaseError.message);
            return;
        }

        toast.error("Something went wrong.");
    };

    return (
        <div className="bg-slate-900 text-slate-100 min-h-screen py-8">
            <div className="container mx-auto px-4 max-w-7xl">

                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
                    <Link href="/" className="hover:text-slate-100 transition-colors">Avaleht</Link>
                    <span>/</span>
                    <Link href="/products" className="hover:text-slate-100 transition-colors">Kataloog</Link>
                    <span>/</span>
                    <span className="text-slate-100 font-medium truncate max-w-xs">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Image Gallery */}
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden p-8 flex items-center justify-center aspect-square lg:aspect-auto h-full max-h-[600px]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-contain max-w-md max-h-[500px]"
                        />
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        <div className="mb-4">
                            <span className="inline-block px-3 py-1 bg-slate-800 text-slate-200 rounded-full text-sm font-medium mb-3 border border-slate-700">
                                {product.category || 'Määramata'}
                            </span>
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-2">{product.name}</h1>
                            {product.sku && (
                                <p className="text-slate-400 text-sm">Tootekood: {product.sku}</p>
                            )}
                        </div>

                        {/* Partner Info */}
                        {hasPartnerInfo && (
                            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-700">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                                    {companyInitials}
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Müüja</p>
                                    <p className="font-bold text-slate-100">{companyName || "Tundmatu"}</p>
                                </div>
                            </div>
                        )}

                        <div className="mb-8">
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-4xl font-bold text-slate-100">{Number(displayPrice).toFixed(2)} €</span>
                                {displayUnit && <span className="text-slate-400 mb-1 font-medium">/ {displayUnit}</span>}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                {isAvailable ? (
                                    <div className="flex items-center gap-2 text-emerald-200 font-medium bg-emerald-900/40 px-3 py-1 rounded-full">
                                        <div className="w-2 h-2 rounded-full bg-emerald-300"></div>
                                        {displayStockCount !== null
                                            ? `Laos: ${displayStockCount} ${displayUnit || ''}`.trim()
                                            : 'Saadaval'}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-red-300 font-medium bg-red-900/40 px-3 py-1 rounded-full">
                                        <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                        Otsas
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <button
                                onClick={() => void handleAddOffer(primaryOffer?.id)}
                                disabled={!primaryOffer || isOfferOutOfStock(primaryOffer)}
                                className="flex-1 bg-emerald-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-emerald-700 transition-all hover:shadow-lg hover:shadow-emerald-200 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <ShoppingCart size={20} />
                                Lisa korvi
                            </button>
                        </div>

                        {shouldShowOffersNotice && (
                            <div className="mb-8 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl p-4 text-sm">
                                {offersErrorMessage || "Partnerite pakkumised puuduvad selle toote jaoks."}
                            </div>
                        )}

                        {/* Compare Prices */}
                        {sortedOffers.length > 0 && (
                            <div className="mb-10">
                                <div className="bg-neutral-900 text-neutral-100 border border-neutral-800 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold mb-3">Võrdle hindu</h3>
                                    <div className="text-sm text-neutral-300 mb-5 flex flex-wrap gap-4">
                                        <span>Min: <span className="text-neutral-100 font-semibold">{formatPrice(minPrice)}</span></span>
                                        <span>Max: <span className="text-neutral-100 font-semibold">{formatPrice(maxPrice)}</span></span>
                                        <span>Avg: <span className="text-neutral-100 font-semibold">{formatPrice(avgPrice)}</span></span>
                                    </div>

                                    <div className="space-y-4">
                                        {sortedOffers.map((offer) => {
                                            const offerCompany = offer.store?.name?.trim()
                                                || offer.store?.brand_name?.trim()
                                                || offer.store_name?.trim()
                                                || "Tundmatu";
                                            const offerUnit = offer.unit || product.unit;
                                            const offerStock = typeof offer.stock === 'number' ? offer.stock : null;
                                            const isOutOfStock = offerStock === 0;

                                            return (
                                                <div key={offer.id} className="bg-neutral-800 border border-neutral-700 rounded-xl p-5">
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                        <div>
                                                            <p className="text-xs text-neutral-400 uppercase tracking-wide font-semibold mb-1">Müüja</p>
                                                            <p className="text-lg font-bold text-neutral-100">{offerCompany}</p>
                                                            {offer.store?.city && (
                                                                <p className="text-sm text-neutral-400">{offer.store.city}</p>
                                                            )}
                                                            <div className="mt-3">
                                                                {isOutOfStock ? (
                                                                    <span className="inline-flex items-center gap-2 text-red-200 font-medium bg-red-900/40 px-3 py-1 rounded-full text-xs">
                                                                        <span className="w-2 h-2 rounded-full bg-red-400"></span>
                                                                        Otsas
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-2 text-emerald-200 font-medium bg-emerald-900/40 px-3 py-1 rounded-full text-xs">
                                                                        <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
                                                                        {offerStock !== null ? `Laos: ${offerStock} ${offerUnit || ''}`.trim() : 'Saadaval'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="text-right">
                                                <div className="text-2xl font-bold text-neutral-100">
                                                    {typeof offer.price === "number" ? `${offer.price.toFixed(2)} €` : "—"}
                                                </div>
                                                            {offerUnit && <div className="text-sm text-neutral-400">/ {offerUnit}</div>}
                                                            {bestOfferId === offer.id && (
                                                                <div className="inline-block mt-2 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full">
                                                                    Parim hind
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => void handleAddOffer(offer.id)}
                                                        disabled={isOutOfStock}
                                                        className="mt-4 w-full bg-emerald-600 text-white font-bold py-3 text-lg rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600"
                                                    >
                                                        <ShoppingCart size={18} />
                                                        Lisa korvi
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Features / Description */}
                        <div className="space-y-6">
                            {product.description && (
                                <div>
                                    <h3 className="font-bold text-slate-100 mb-3 text-lg">Kirjeldus</h3>
                                    <div className="text-slate-200 leading-relaxed text-base prose prose-invert max-w-none">
                                        {product.description}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                <div className="flex items-start gap-4 p-5 bg-slate-800 rounded-xl border border-slate-700 shadow-sm">
                                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                        <Truck size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-100 text-sm mb-1">Kiire tarne</h4>
                                        <p className="text-xs text-slate-300 leading-relaxed">Tarne 1-3 tööpäeva jooksul üle Eesti.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-5 bg-slate-800 rounded-xl border border-slate-700 shadow-sm">
                                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-100 text-sm mb-1">Turvaline ost</h4>
                                        <p className="text-xs text-slate-300 leading-relaxed">Kontrollitud partnerid ja turvalised maksed.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Similar Products */}
                {similarProducts && similarProducts.length > 0 && (
                    <div className="border-t border-slate-800 pt-16">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-slate-100">Sarnased tooted</h2>
                            <Link href="/products" className="text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1 group">
                                Vaata kõiki
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {similarProducts.map((prod) => (
                                <Link href={`/products/${prod.id}`} key={prod.id} className="group bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:shadow-md transition-all hover:border-emerald-400">
                                    <div className="aspect-square bg-slate-900/40 p-6 flex items-center justify-center relative overflow-hidden">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={getProductImage(prod)}
                                            alt={prod.name}
                                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-medium text-slate-100 mb-1 truncate group-hover:text-emerald-300 transition-colors">{prod.name}</h3>
                                        <p className="font-bold text-slate-100">{Number(prod.price).toFixed(2)} €</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
