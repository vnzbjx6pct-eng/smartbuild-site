import Link from "next/link";
import { Package, ShoppingCart, TrendingUp, ArrowRight } from "lucide-react";
import { createServerClient } from "@/app/lib/supabase/server";

export const dynamic = 'force-dynamic';

export default async function PartnerDashboardPage() {
    const supabase = createServerClient();

    // Get Session
    const { data: { session } } = await supabase.auth.getSession();
    // In a real app, layout or middleware handles redirect. 
    // Here we can return null or a message if no session to avoid crash if layout fails.
    if (!session) return <div className="p-8">Access Denied</div>;

    const partnerId = session.user.id;

    // 1. Fetch Products Count
    const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('partner_id', partnerId);

    // 2. Fetch Orders Count & Revenue
    const { data: ordersData, count: ordersCount } = await supabase
        .from('orders')
        .select('id, total_amount, status, created_at, customer_email')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false });

    // Calculate details
    const recentOrders = ordersData?.slice(0, 5) || [];
    const totalOrders = ordersCount || 0;
    const revenue = ordersData?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;

    // Helper for formatting currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }).format(amount);
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Töölaud</h1>
                <p className="text-slate-500">Tere tulemast tagasi! Siin on sinu poe ülevaade.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Package size={24} />
                        </div>
                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">+0%</span>
                    </div>
                    <div className="text-sm text-slate-500 font-medium mb-1">Tooteid kokku</div>
                    <div className="text-3xl font-bold text-slate-900">{productsCount || 0}</div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                            <ShoppingCart size={24} />
                        </div>
                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">+0%</span>
                    </div>
                    <div className="text-sm text-slate-500 font-medium mb-1">Tellimusi kokku</div>
                    <div className="text-3xl font-bold text-slate-900">{totalOrders}</div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                            <TrendingUp size={24} />
                        </div>
                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">+0%</span>
                    </div>
                    <div className="text-sm text-slate-500 font-medium mb-1">Kogutulu</div>
                    <div className="text-3xl font-bold text-slate-900">{formatCurrency(revenue)}</div>
                </div>
            </div>

            {/* Recent Orders & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                        <h2 className="font-bold text-lg text-slate-900">Viimased tellimused</h2>
                        <Link href="/partner/orders" className="text-sm font-bold text-emerald-600 hover:text-emerald-700">
                            Vaata kõiki
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                                <tr>
                                    <th className="px-6 py-4">Tellimus</th>
                                    <th className="px-6 py-4">Klient (Email)</th>
                                    <th className="px-6 py-4">Summa</th>
                                    <th className="px-6 py-4">Staatus</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                                            Hetkel tellimusi ei ole.
                                        </td>
                                    </tr>
                                ) : (
                                    recentOrders.map((order: any) => (
                                        <tr key={order.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 font-mono text-sm">{order.id.slice(0, 8)}...</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{order.customer_email || "N/A"}</td>
                                            <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(order.total_amount)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                                                        order.status === 'confirmed' ? 'bg-yellow-100 text-yellow-700' :
                                                            order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                                                                order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                                    'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-emerald-600 rounded-xl p-6 text-white shadow-md">
                        <h3 className="font-bold text-lg mb-2">Lisa uus toode</h3>
                        <p className="text-emerald-100 text-sm mb-6">Täienda oma kaubavalikut uute toodetega.</p>
                        <Link href="/partner/products" className="inline-flex items-center gap-2 bg-white text-emerald-600 px-4 py-2 rounded-lg font-bold hover:bg-emerald-50 transition-colors w-full justify-center">
                            Ava tooted <ArrowRight size={18} />
                        </Link>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4">Kiirviited</h3>
                        <div className="space-y-3">
                            <Link href="/partner/orders" className="block p-3 rounded-lg hover:bg-slate-50 border border-slate-100 text-slate-600 font-medium transition-colors">
                                Sissetulevad tellimused
                            </Link>
                            <Link href="/partner/products" className="block p-3 rounded-lg hover:bg-slate-50 border border-slate-100 text-slate-600 font-medium transition-colors">
                                Impordi CSV-st
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
