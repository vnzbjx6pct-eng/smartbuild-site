import { NextResponse } from 'next/server';
import { checkDeliveryEligibility, WoltConfig, WOLT_CONFIG } from '@/app/lib/wolt';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { items, city } = body;

        if (!items || !Array.isArray(items)) {
            return NextResponse.json({ error: "Invalid items" }, { status: 400 });
        }

        if (!city) {
            return NextResponse.json({ error: "City required" }, { status: 400 });
        }

        // Use shared logic
        const eligibility = checkDeliveryEligibility(items, city);

        return NextResponse.json({
            eligibility,
            config: {
                isDemo: WOLT_CONFIG.isDemo,
                env: WOLT_CONFIG.env
            }
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
