
import { NextResponse } from "next/server";
import type { AnalyticsEventName } from "@/app/lib/analytics";
import { trackEvent } from "@/app/lib/analytics";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { event, properties, userId } = body;

        if (!event) {
            return NextResponse.json({ error: "Missing event name" }, { status: 400 });
        }

        // Forward to server-side helper
        await trackEvent(event as AnalyticsEventName, userId, properties);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Analytics API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
