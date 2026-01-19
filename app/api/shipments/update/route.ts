import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { notifyOnShipmentChange } from "@/app/lib/notifications/service";
import { DeliveryReasonCode } from "@/app/lib/delivery/reasonCodes";
import { ShipmentStatus } from "@/app/lib/types";

// Admin/Partner/Webhook endpoint
export async function POST(req: NextRequest) {
    // Lazy init for static build safety
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        const body = await req.json();
        const { shipmentId, status, message, reasonCode, visibility = 'public' } = body;

        if (!shipmentId || !status) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Update Shipment
        const shipmentUpdateData: any = { status };

        // If providing a new reason code (even if null to clear), update it
        if (reasonCode !== undefined) {
            shipmentUpdateData.status_reason_code = reasonCode;
        }

        const { error: updateError } = await supabaseAdmin
            .from("shipments")
            .update(shipmentUpdateData)
            .eq("id", shipmentId);

        if (updateError) throw updateError;

        // 2. Insert Timeline Event
        const { error: eventError } = await supabaseAdmin
            .from("shipment_events")
            .insert({
                shipment_id: shipmentId,
                event_status: status,
                message: message || undefined,
                reason_code: reasonCode || undefined,
                visibility: visibility // 'public' | 'internal'
            });

        if (eventError) throw eventError;

        // 4. Trigger Notification (Async)
        if (visibility === 'public') {
            // We need owner user_id. Fetch from shipments table actually to be safe (via join or 2nd query)
            // Or assume order_id was fetched? The route only takes IDs.
            // We need to fetch order_id
            const { data: shipData } = await supabaseAdmin
                .from('shipments')
                .select('order_id')
                .eq('id', shipmentId)
                .single();

            if (shipData?.order_id) {
                const { data: orderData } = await supabaseAdmin
                    .from('orders')
                    .select('user_id')
                    .eq('id', shipData.order_id)
                    .single();

                if (orderData?.user_id) {
                    await notifyOnShipmentChange({
                        userId: orderData.user_id,
                        orderId: shipData.order_id,
                        shipmentId: shipmentId,
                        newStatus: status,
                        reasonCode: reasonCode as DeliveryReasonCode,
                        eventType: (status === 'dispatched' || status === 'delivered') ? 'shipment_status' : 'action_required'
                        // Note: If status != dispatched/delivered/action, service will filter it out. 
                        // But we should probably only call it if it matches our MVP list?
                        // Service has filtering logic, so passing 'shipment_status' is fine, it will check newStatus.
                        // However, for 'action_required', we rely on reasonCode severity check inside service?
                        // Actually service checks: if eventType=action_required OR severity=action_required.
                        // So we can default to 'shipment_status' and let severity escalation happen.
                    });
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("Error updating shipment:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
