import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Papa from "papaparse";

// Lazy init inside handler to prevent build errors
const getSupabaseAdmin = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { importId } = body;
        const authHeader = req.headers.get("Authorization");

        if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const token = authHeader.replace("Bearer ", "");
        const supabaseAdmin = getSupabaseAdmin();
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Get Import Record
        const { data: importJob } = await supabaseAdmin.from("imports").select("*").eq("id", importId).single();
        if (!importJob) return NextResponse.json({ error: "Import not found" }, { status: 404 });

        // Verify Access
        const { data: membership } = await supabaseAdmin.from("store_users").select("*").eq("user_id", user.id).eq("store_id", importJob.store_id).single();
        if (!membership) return NextResponse.json({ error: "Access denied" }, { status: 403 });

        if (importJob.status === "applied") return NextResponse.json({ message: "Already applied" });

        // Parse & Apply
        const fileContent = importJob.file_content;
        const mapping = importJob.mapping_json;
        const parsed = Papa.parse(fileContent, { header: true, skipEmptyLines: true });
        const rows = parsed.data as any[];

        let created = 0;
        let updated = 0;
        let failed = 0;
        const errors: any[] = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const mapped: any = {};

            for (const [dbField, csvHeader] of Object.entries(mapping)) {
                if (csvHeader) {
                    let val = row[csvHeader as string];

                    // Formatting
                    if (dbField === 'price') {
                        val = val ? parseFloat(String(val).replace(",", ".")) : 0;
                        if (isNaN(val)) val = 0;
                    }
                    if (dbField === 'weight_kg' || dbField.endsWith('_cm')) {
                        val = val ? parseFloat(String(val).replace(",", ".")) : null;
                    }
                    if (dbField === 'delivery_allowed_wolt' || dbField === 'hazmat') {
                        val = (String(val).toLowerCase() === 'true' || String(val) === '1' || String(val).toLowerCase() === 'yes');
                    }

                    mapped[dbField] = val;
                }
            }

            // LOGIC: Upsert by SKU or EAN
            // We need at least SKU or EAN or Name to exist?
            // If SKU exists, upsert on (store_id, sku).

            // Mandatory checks
            if (!mapped.sku && !mapped.ean) {
                failed++;
                errors.push({ row: i + 1, error: "Missing SKU and EAN" });
                continue;
            }
            if (!mapped.price) {
                // Or maybe allow price 0? Warning maybe.
            }
            if (!mapped.name_override_et) {
                // Try to fallback to 'name' column if user mapped 'name' to it?
                // In schema it is name_override_et.
                if (row['name']) mapped.name_override_et = row['name']; // Fallback explicit
            }

            // Calc missing dimensions
            const hasWeight = mapped.weight_kg !== null && mapped.weight_kg > 0;
            const hasDims = mapped.length_cm && mapped.width_cm && mapped.height_cm;
            mapped.missing_dimensions = (!hasWeight || !hasDims);

            // Defaults
            mapped.store_id = importJob.store_id;

            // UPSERT
            // We'll try to match by SKU
            if (mapped.sku) {
                const { error } = await supabaseAdmin.from("store_products").upsert(mapped, { onConflict: 'store_id, sku' });
                if (error) { failed++; errors.push({ row: i + 1, error: error.message }); }
                else updated++; // Simplified count
            } else if (mapped.ean) {
                const { error } = await supabaseAdmin.from("store_products").upsert(mapped, { onConflict: 'store_id, ean' });
                if (error) { failed++; errors.push({ row: i + 1, error: error.message }); }
                else updated++;
            }
        }

        // Finish
        await supabaseAdmin.from("imports").update({
            status: "applied",
            summary_json: { total_rows: rows.length, created_count: created, updated_count: updated, error_rows: failed },
            errors_json: errors.slice(0, 100) // Limit size
        }).eq("id", importId);

        return NextResponse.json({ success: true, created, updated, failed });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
