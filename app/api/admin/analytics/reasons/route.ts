import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check permissions if needed (skipping for now as per instructions "simple aggregate")
    // In real app, verify admin session

    // Count per reason_code
    const { data, error } = await supabaseAdmin
        .from('shipments')
        .select('status_reason_code, store_id')
        .not('status_reason_code', 'is', null);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const simpleCounts: Record<string, number> = {};
    const storeCounts: Record<string, Record<string, number>> = {};

    data.forEach(row => {
        const code = row.status_reason_code;
        const store = row.store_id || 'unknown';

        if (code) {
            // Total
            simpleCounts[code] = (simpleCounts[code] || 0) + 1;

            // Per Store
            if (!storeCounts[store]) storeCounts[store] = {};
            storeCounts[store][code] = (storeCounts[store][code] || 0) + 1;
        }
    });

    return NextResponse.json({
        total: simpleCounts,
        by_store: storeCounts
    });
}
