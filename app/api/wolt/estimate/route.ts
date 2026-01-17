import { NextResponse } from "next/server";
import { WOLT_CONFIG, PARNU_WAREHOUSE, WoltEstimateRequest, WoltEstimateResponse } from "@/app/lib/wolt";

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as WoltEstimateRequest;

        // Basic Validation
        if (!body.dropoff.street || !body.dropoff.city || !body.dropoff.phone) {
            return NextResponse.json({ error: "Missing required address fields" }, { status: 400 });
        }

        // DEMO MODE
        if (WOLT_CONFIG.isDemo) {
            console.log("[Wolt] Using DEMO mode for estimation");

            // Simulate API delay
            await new Promise(r => setTimeout(r, 600));

            // Calculate Weight based on mock data lookup
            const { PRODUCTS } = await import("@/app/lib/mockData");
            let totalWeight = 0;

            for (const item of body.items) {
                const product = PRODUCTS.find(p => p.id === item.id || p.name === item.name);
                if (product) {
                    totalWeight += (product.weightKg || 1) * item.count;
                }
            }

            // Deterministic Factors
            const city = body.dropoff.city || "Tallinn";
            const cityFactorMap: Record<string, number> = {
                "Tallinn": 0,
                "Tartu": 1.5,
                "Pärnu": 1.0,
                "Narva": 2.5,
            };
            const cityFactor = cityFactorMap[city] || 2.0;

            // Price Formula: Base + (Weight * Factor) + City
            const basePrice = 3.90;
            const weightPrice = Math.min(totalWeight * 0.15, 5); // Cap weight surcharge at 5€
            const price = Number((basePrice + weightPrice + cityFactor).toFixed(2));

            // Time Formula: 25-45 base + city offset
            const baseTime = 25;
            const timeOffset = (city.length * 3) % 15; // Deterministic "random" based on string length
            const eta = Math.min(45, Math.max(25, baseTime + timeOffset));

            const response: WoltEstimateResponse = {
                price,
                currency: "EUR",
                eta_minutes: eta,
                token: "demo_binding_token_" + Date.now(),
                is_demo: true,
            };

            return NextResponse.json(response);
        }

        // TODO: Real API Implementation
        // For now, even if not demo, we fallback to demo logic because we don't have keys in this env usually
        return NextResponse.json({ error: "Real API not configured" }, { status: 501 });

    } catch (error) {
        console.error("Wolt Estimate Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
