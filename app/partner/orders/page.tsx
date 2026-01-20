import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import OrdersTableClient from "./OrdersTableClient";

export const dynamic = 'force-dynamic';

export default async function PartnerOrdersPage({ searchParams }: { searchParams: { status?: string } }) {
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return <div>Access Denied</div>;

    const statusFilter = searchParams.status; // simple filter

    let query = supabase
        .from('orders')
        .select('*')
        .eq('partner_id', session.user.id)
        .order('created_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
    }

    const { data: orders, error } = await query;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Tellimused</h1>
                    <p className="text-slate-500">Halda sissetulevaid tellimusi.</p>
                </div>
            </div>

            <OrdersTableClient initialOrders={orders || []} currentStatus={statusFilter} />
        </div>
    );
}
