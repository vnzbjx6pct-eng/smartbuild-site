"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/app/actions/partner-orders";

export default function OrderDetailsClient({ order }: { order: any }) {
    const [status, setStatus] = useState(order.status);
    const [loading, setLoading] = useState(false);

    const handleStatusChange = async (newStatus: string) => {
        setLoading(true);
        try {
            await updateOrderStatus(order.id, newStatus);
            setStatus(newStatus);
        } catch (e) {
            alert("Viga staatuse muutmisel");
        } finally {
            setLoading(false);
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
        <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-500">Staatus:</span>
            <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={loading}
                className={`text-sm font-bold uppercase rounded-lg px-3 py-2 border-none focus:ring-2 focus:ring-emerald-500 cursor-pointer ${statusColors[status] || 'bg-slate-100'}`}
            >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
            </select>
        </div>
    );
}
