"use client";

import { useCart } from "@/app/components/cart/CartProvider";
import { ShoppingBag, ArrowRight, Trash2, ShieldCheck, Truck, CreditCard } from "lucide-react";
import Link from "next/link";
import { getProductImage } from "@/app/lib/imageUtils";

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, clearCart } = useCart();

    if (!cart || cart.items.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 pt-16 pb-12 flex flex-col items-center justify-center text-center px-4">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <ShoppingBag size={48} className="text-slate-300" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Sinu ostukorv on tühi</h1>
                <p className="text-slate-500 mb-8 max-w-md">
                    Sirvi meie tootevalikut ja lisa tooteid ostukorvi, et näha neid siin.
                </p>
                <Link
                    href="/products"
                    className="bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                >
                    Mine poodi
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-8 pb-16">
            <div className="container mx-auto px-4 max-w-6xl">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">Ostukorv</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items List */}
                    <div className="flex-1 space-y-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h2 className="font-bold text-slate-900 text-lg">Tooted ({cart.itemsCount})</h2>
                                <button
                                    onClick={clearCart}
                                    className="text-sm text-red-500 hover:text-red-700 hover:underline flex items-center gap-1"
                                >
                                    <Trash2 size={14} />
                                    Tühjenda korv
                                </button>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {cart.items.map((item) => (
                                    <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start group hover:bg-slate-50 transition-colors">
                                        <div className="w-24 h-24 bg-white rounded-xl border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center p-2">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={getProductImage(item.product)}
                                                alt={item.product.name}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0 flex flex-col sm:flex-row justify-between w-full gap-4">
                                            <div className="flex-1">
                                                <Link href={`/products/${item.product.id}`} className="font-bold text-slate-900 text-lg mb-1 block hover:text-emerald-700 transition-colors">
                                                    {item.product.name}
                                                </Link>
                                                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{item.product.category}</p>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Müüja:</span>
                                                    {item.product?.profiles && (
                                                        <span className="text-sm font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                                                            {item.product.profiles.company_name || "Tundmatu"}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 sm:gap-1">
                                                <div className="text-xl font-bold text-slate-900">{Number(item.product.price).toFixed(2)} €</div>
                                                <div className="text-sm text-slate-500 mb-2">/ {item.product.unit}</div>

                                                <div className="flex items-center bg-white border border-slate-200 rounded-lg">
                                                    <button
                                                    onClick={() => updateQuantity(item.offer_id, item.quantity - 1)}
                                                        className="px-3 py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-l-lg transition-colors border-r border-slate-100"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        -
                                                    </button>
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                    onChange={(e) => updateQuantity(item.offer_id, parseInt(e.target.value) || 1)}
                                                        className="w-12 text-center py-1 text-sm font-medium focus:outline-none"
                                                    />
                                                    <button
                                                    onClick={() => updateQuantity(item.offer_id, item.quantity + 1)}
                                                        className="px-3 py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-r-lg transition-colors border-l border-slate-100"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => removeFromCart(item.offer_id)}
                                                    className="sm:hidden text-red-500 text-sm mt-2"
                                                >
                                                    Eemalda
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => removeFromCart(item.offer_id)}
                                            className="hidden sm:block text-slate-300 hover:text-red-500 transition-colors p-2"
                                            title="Eemalda toode"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm">Turvaline ost</h3>
                                    <p className="text-xs text-slate-500">100% raha tagasi garantii</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                    <Truck size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm">Kiire tarne</h3>
                                    <p className="text-xs text-slate-500">Üle kogu Eesti 1-3 päevaga</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                                    <CreditCard size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm">Paindlikud maksed</h3>
                                    <p className="text-xs text-slate-500">Pank, kaart või järelmaks</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="lg:w-96 shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Tellimuse kokkuvõte</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-slate-600">
                                    <span>Vahesumma</span>
                                    <span>{cart.total.toFixed(2)} €</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Käibemaks (22%)</span>
                                    <span>{(cart.total * 0.22).toFixed(2)} €</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Tarne</span>
                                    <span className="text-sm bg-slate-100 px-2 py-0.5 rounded text-slate-500">Arvutatakse järgmisel sammul</span>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-4 mb-8">
                                <div className="flex justify-between items-end">
                                    <span className="font-bold text-slate-900 text-lg">Kokku</span>
                                    <div className="text-right">
                                        <span className="block text-3xl font-bold text-emerald-600">{(cart.total * 1.22).toFixed(2)} €</span>
                                        <span className="text-xs text-slate-400">Sisaldab käibemaksu</span>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href="/checkout"
                                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-4 px-6 rounded-xl hover:bg-emerald-600 transition-all shadow-lg hover:shadow-emerald-200 active:scale-[0.98]"
                            >
                                Vormista tellimus
                                <ArrowRight size={20} />
                            </Link>

                            <p className="text-xs text-center text-slate-400 mt-4">
                                Jätkates nõustud meie <Link href="/terms" className="underline hover:text-slate-600">müügitingimustega</Link>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}