import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { notFound } from "next/navigation";
import OrderDetailsClient from "@/app/partner/orders/[id]/OrderDetailsClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return <div>Access Denied</div>;

    const { id } = params;

    // Fetch order
    const { data: order, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(*))')
        .eq('id', id)
        .eq('partner_id', session.user.id)
        .single();

    if (error || !order) {
        notFound();
    }

    return (
        <div>
            <div className="mb-6">
                <Link href="/partner/orders" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4">
                    <ArrowLeft size={18} /> Tagasi tellimuste juurde
                </Link>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Tellimus #{order.id.slice(0, 8)}</h1>
                        <div className="text-slate-500">Klient: {order.customer_email || "Külaline"}</div>
                    </div>
                    <OrderDetailsClient order={order} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Items */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-200 font-bold text-slate-900">
                            Tellimuse sisu
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                                <tr>
                                    <th className="px-6 py-4">Toode</th>
                                    <th className="px-6 py-4">Kogus</th>
                                    <th className="px-6 py-4">Hind</th>
                                    <th className="px-6 py-4">Kokku</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {order.order_items.map((item: any) => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900">{item.products?.name || "Tundmatu toode"}</div>
                                            <div className="text-xs text-slate-500">{item.products?.sku}</div>
                                        </td>
                                        <td className="px-6 py-4">{item.quantity} tk</td>
                                        <td className="px-6 py-4">{Number(item.price_at_time).toFixed(2)} €</td>
                                        <td className="px-6 py-4 font-bold">{(item.quantity * item.price_at_time).toFixed(2)} €</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-slate-50 border-t border-slate-200">
                                <tr>
                                    <td colSpan={3} className="px-6 py-4 text-right font-bold text-slate-500">Kokku:</td>
                                    <td className="px-6 py-4 font-bold text-xl text-slate-900">{Number(order.total_amount).toFixed(2)} €</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4">Info</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Kuupäev:</span>
                                <span className="font-medium">{new Date(order.created_at).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Viimati muudetud:</span>
                                <span className="font-medium">{new Date(order.updated_at).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
