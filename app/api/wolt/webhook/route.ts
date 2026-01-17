import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        // Stub for future webhook integration
        // Wolt sends status updates here

        const body = await request.json();
        console.log("[Wolt Webhook] Received:", JSON.stringify(body).slice(0, 200));

        // TODO: Validate signature if secret exists
        // TODO: Update order status in tracking DB

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error("Wolt Webhook Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
