"use client";

import { useState } from "react";
import { Search, Eye, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/app/actions/partner-orders";

export default function OrdersTableClient({ initialOrders, currentStatus }: { initialOrders: any[], currentStatus?: string }) {
    const [orders, setOrders] = useState(initialOrders);
    const router = useRouter();

    const handleStatusFilter = (status: string) => {
        router.push(`/partner/orders?status=${status}`);
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await updateOrderStatus(id, newStatus);
            // Optimistic update
            setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        } catch (e) {
            alert("Error updating status");
        }
    };

    const statusColors: Record<string, string> = {
        'pending': 'bg-blue-100 text-blue-700',
        'confirmed': 'bg-yellow-100 text-yellow-700',
        'shipped': 'bg-purple-100 text-purple-700',
        'delivered': 'bg-green-100 text-green-700',
        'cancelled': 'bg-slate-100 text-slate-500'
    };

    return (
        <div>
            <div className="mb-6 flex gap-2">
                {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
                    <button
                        key={s}
                        onClick={() => handleStatusFilter(s)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium capitalize border ${(currentStatus === s || (!currentStatus && s === 'all'))
                                ? 'bg-emulator-50 border-emerald-500 text-emerald-700'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                        <tr>
                            <th className="px-6 py-4">Tellimus</th>
                            <th className="px-6 py-4">Klient</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                    Tellimusi ei leitud.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order: any) => (
                                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-sm">{order.id.slice(0, 8)}...</td>
                                    <td className="px-6 py-4 text-sm">{order.customer_email || "Guest"}</td>
                                    <td className="px-6 py-4 font-bold">{order.total_amount} €</td>
                                    <td className="px-6 py-4 text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            className={`text-xs font-bold uppercase rounded px-2 py-1 border-none focus:ring-2 focus:ring-emerald-500 cursor-pointer ${statusColors[order.status] || 'bg-slate-100'}`}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-slate-400 hover:text-emerald-600">
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
