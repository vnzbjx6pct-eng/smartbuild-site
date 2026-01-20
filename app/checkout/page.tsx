"use client";

import { useCart } from "@/app/components/cart/CartProvider";
import { ArrowLeft, Check, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CheckoutPage() {
    const { cart, isLoading } = useCart();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && (!cart || cart.items.length === 0)) {
            router.push('/cart');
        }
    }, [cart, isLoading, router]);

    if (!cart) return null;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="container mx-auto px-4 max-w-6xl h-16 flex items-center justify-between">
                    <Link href="/cart" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium">
                        <ArrowLeft size={18} />
                        Tagasi ostukorvi
                    </Link>
                    <div className="flex items-center gap-2 text-emerald-600 font-bold">
                        <Lock size={16} />
                        Turvaline makse
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-6xl mt-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Main Form */}
                    <div className="flex-1 space-y-8">
                        {/* Steps */}
                        <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2">
                            <div className="flex items-center gap-2 text-emerald-600 font-bold whitespace-nowrap">
                                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm">1</div>
                                Kontaktandmed
                            </div>
                            <div className="h-px w-8 bg-slate-200 shrink-0"></div>
                            <div className="flex items-center gap-2 text-slate-400 font-medium whitespace-nowrap">
                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-sm">2</div>
                                Tarneviis
                            </div>
                            <div className="h-px w-8 bg-slate-200 shrink-0"></div>
                            <div className="flex items-center gap-2 text-slate-400 font-medium whitespace-nowrap">
                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-sm">3</div>
                                Makse
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Kontaktandmed</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Eesnimi</label>
                                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Perekonnanimi</label>
                                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                                    <input type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Telefon</label>
                                    <input type="tel" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end">
                                <button className="bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
                                    Jätka tarne valikuga
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:w-96 shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24">
                            <h3 className="font-bold text-slate-900 mb-4">Tellimuse sisu</h3>
                            <div className="space-y-4 max-h-80 overflow-y-auto mb-6 pr-2">
                                {cart.items.map((item) => (
                                    <div key={item.id} className="flex gap-3 text-sm">
                                        <div className="w-12 h-12 bg-slate-50 rounded-lg border border-slate-100 shrink-0 flex items-center justify-center p-1">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            {item.product.image_url && <img src={item.product.image_url} alt="" className="w-full h-full object-contain" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-slate-900 line-clamp-1">{item.product.name}</div>
                                            <div className="text-slate-500">{item.quantity} x {Number(item.product.price).toFixed(2)} €</div>
                                        </div>
                                        <div className="font-medium text-slate-900">
                                            {(item.quantity * item.product.price).toFixed(2)} €
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-slate-100 pt-4 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Vahesumma</span>
                                    <span className="font-medium text-slate-900">{cart.total.toFixed(2)} €</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Käibemaks</span>
                                    <span className="font-medium text-slate-900">{(cart.total * 0.22).toFixed(2)} €</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold border-t border-slate-100 pt-3 mt-3">
                                    <span className="text-slate-900">Kokku</span>
                                    <span className="text-emerald-600">{(cart.total * 1.22).toFixed(2)} €</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
