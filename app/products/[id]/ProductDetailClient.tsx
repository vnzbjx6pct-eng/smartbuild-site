"use client";

import Link from "next/link";
import { ShoppingCart, Truck, ShieldCheck, ArrowRight } from 'lucide-react';

import type { Product } from "@/app/types";

// Helper type for similar products (subset of Product)
type SimilarProduct = Pick<Product, 'id' | 'name' | 'price' | 'image_url' | 'category'>;

interface ProductDetailClientProps {
    product: Product;
    similarProducts: SimilarProduct[];
}

export default function ProductDetailClient({ product, similarProducts }: ProductDetailClientProps) {

    if (!product) return null;

    return (
        <div className="bg-slate-50 min-h-screen py-8">
            <div className="container mx-auto px-4 max-w-7xl">

                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <Link href="/" className="hover:text-slate-900 transition-colors">Avaleht</Link>
                    <span>/</span>
                    <Link href="/products" className="hover:text-slate-900 transition-colors">Kataloog</Link>
                    <span>/</span>
                    <span className="text-slate-900 font-medium truncate max-w-xs">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Image Gallery */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden p-8 flex items-center justify-center aspect-square lg:aspect-auto h-full max-h-[600px]">
                        {product.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-contain max-w-md max-h-[500px]"
                            />
                        ) : (
                            <div className="text-slate-300 flex flex-col items-center">
                                <ShieldCheck size={64} className="mb-2 opacity-20" />
                                <span>Pilt puudub</span>
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        <div className="mb-4">
                            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium mb-3">
                                {product.category || 'Määramata'}
                            </span>
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{product.name}</h1>
                            {product.sku && (
                                <p className="text-slate-500 text-sm">Tootekood: {product.sku}</p>
                            )}
                        </div>

                        {/* Partner Info */}
                        {product.profiles && (
                            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                                    {product.profiles.company_name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Müüja</p>
                                    <p className="font-bold text-slate-900">{product.profiles.company_name}</p>
                                </div>
                            </div>
                        )}

                        <div className="mb-8">
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-4xl font-bold text-slate-900">{Number(product.price).toFixed(2)} €</span>
                                {product.unit && <span className="text-slate-500 mb-1 font-medium">/ {product.unit}</span>}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                {Number(product.stock) > 0 ? (
                                    <div className="flex items-center gap-2 text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full">
                                        <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                                        Laos: {product.stock} {product.unit}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-red-600 font-medium bg-red-50 px-3 py-1 rounded-full">
                                        <div className="w-2 h-2 rounded-full bg-red-600"></div>
                                        Otsas
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <button className="flex-1 bg-emerald-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-emerald-700 transition-all hover:shadow-lg hover:shadow-emerald-200 flex items-center justify-center gap-3 active:scale-[0.98]">
                                <ShoppingCart size={20} />
                                Lisa korvi
                            </button>
                        </div>

                        {/* Features / Description */}
                        <div className="space-y-6">
                            {product.description && (
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-3 text-lg">Kirjeldus</h3>
                                    <div className="text-slate-600 leading-relaxed text-base prose prose-slate max-w-none">
                                        {product.description}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-slate-100 shadow-sm">
                                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                        <Truck size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm mb-1">Kiire tarne</h4>
                                        <p className="text-xs text-slate-500 leading-relaxed">Tarne 1-3 tööpäeva jooksul üle Eesti.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-slate-100 shadow-sm">
                                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm mb-1">Turvaline ost</h4>
                                        <p className="text-xs text-slate-500 leading-relaxed">Kontrollitud partnerid ja turvalised maksed.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Similar Products */}
                {similarProducts && similarProducts.length > 0 && (
                    <div className="border-t border-slate-200 pt-16">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-slate-900">Sarnased tooted</h2>
                            <Link href="/products" className="text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1 group">
                                Vaata kõiki
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {similarProducts.map((prod) => (
                                <Link href={`/products/${prod.id}`} key={prod.id} className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all hover:border-emerald-200">
                                    <div className="aspect-square bg-slate-50 p-6 flex items-center justify-center relative overflow-hidden">
                                        {prod.image_url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={prod.image_url} alt={prod.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                                        ) : (
                                            <div className="text-slate-300">
                                                <ShieldCheck size={40} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-medium text-slate-900 mb-1 truncate group-hover:text-emerald-700 transition-colors">{prod.name}</h3>
                                        <p className="font-bold text-slate-900">{Number(prod.price).toFixed(2)} €</p>
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
