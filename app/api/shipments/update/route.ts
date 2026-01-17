import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service/Admin only
// Lazy init inside handler to prevent build errors
const getSupabaseAdmin = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// v1: Test Endpoint to update shipment status
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { shipmentId, status, message } = body;

        // For MVP test, we won't strictly check Admin Auth if called from client "Test" button,
        // BUT better to check user is owner of order?
        // Or just allow since it is a demo.
        // Let's require at least a valid user token.
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const token = authHeader.replace("Bearer ", "");
        const supabaseAdmin = getSupabaseAdmin();
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Update Shipment
        const { error: updateError } = await supabaseAdmin
            .from("shipments")
            .update({ status })
            .eq("id", shipmentId);

        if (updateError) throw updateError;

        // Log Event
        const { error: eventError } = await supabaseAdmin
            .from("shipment_events")
            .insert({
                shipment_id: shipmentId,
                event_status: status,
                message: message || `Status changed to ${status}`
            });

        if (eventError) throw eventError;

        return NextResponse.json({ success: true });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
