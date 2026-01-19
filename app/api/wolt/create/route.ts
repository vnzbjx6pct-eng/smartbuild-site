import { NextResponse } from "next/server";
import type { WoltOrderResponse } from "@/app/lib/wolt";
import { WOLT_CONFIG } from "@/app/lib/wolt";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Basic Validation
        if (!body.dropoff || !body.pickup) {
            // In real app we might reuse the estimate token to avoid re-sending data, 
            // but here we accept full payload for simplicity.
        }

        // DEMO MODE
        if (WOLT_CONFIG.isDemo) {
            console.log("[Wolt] Creating DEMO order");

            await new Promise(r => setTimeout(r, 2000));

            const orderId = "demo_order_" + Date.now();
            const trackingUrl = `https://wolt.com/tracking/${orderId}?demo=true`;

            const response: WoltOrderResponse = {
                wolt_order_reference_id: orderId,
                tracking_url: trackingUrl,
                status: "received",
                is_demo: true,
            };

            return NextResponse.json(response);
        }

        return NextResponse.json({ error: "Real API not configured" }, { status: 501 });

    } catch (error) {
        console.error("Wolt Create Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
