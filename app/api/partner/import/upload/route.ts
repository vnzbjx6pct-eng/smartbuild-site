import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use Service Role for Admin/Backend ops as requested
// Lazy init inside handler to prevent build errors
const getSupabaseAdmin = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    try {
        // 1. Auth Check (Manually verify user from header or cookie? 
        // Better: use standard Next.js auth helper to get user, then use Admin for DB ops if needed, 
        // or just use the user client if RLS is set up.
        // Prompt said: "Use SUPABASE_SERVICE_ROLE_KEY (only there)".
        // I'll user standard user fetching to identify, then admin to write if needed (or RLS).
        // If I use Admin, I must verify permissions.

        // Actually, let's try to trust RLS + User Context first? 
        // No, standard `createServerClient` from `@supabase/ssr` is best for RLS.
        // But I don't have `@supabase/ssr` configured in `package.json` (I saw `supabase-js`).
        // I'll stick to manual token verification or just assume the user sends an auth token?
        // Native Next.js `req.cookies` + `getUser` is safer.

        // Let's use the project's pattern.
        // I will use `supabaseAdmin` but I need the USER ID to verify access.

        // For MVP speed and hitting the requirement "use SERVICE_ROLE", I will do:
        // 1. Parse request body (FormData)
        // 2. Get user_id (Mocked or passed? No, must be secure)
        // CHECK: Does `supabaseClient.ts` have a server helper? No.

        // OK, I'll assume the client sends the session access_token in Authorization header.
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const token = authHeader.replace("Bearer ", "");
        const supabaseAdmin = getSupabaseAdmin();
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // 2. Parse Form
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const storeId = formData.get("storeId") as string;

        if (!file || !storeId) return NextResponse.json({ error: "Missing file or storeId" }, { status: 400 });

        // 3. Verify Access
        const { data: membership } = await supabaseAdmin
            .from("store_users")
            .select("role")
            .eq("user_id", user.id)
            .eq("store_id", storeId)
            .single();

        if (!membership) return NextResponse.json({ error: "Access denied to this store" }, { status: 403 });

        // 4. Read File Content
        const text = await file.text();

        // 5. Save to Imports table
        const { data, error } = await supabaseAdmin
            .from("imports")
            .insert({
                store_id: storeId,
                status: "uploaded",
                file_name: file.name,
                file_content: text, // Saving raw content
                mapping_json: {},
                summary_json: {},
                errors_json: []
            })
            .select("id")
            .single();

        if (error) throw error;

        return NextResponse.json({ importId: data.id });
    } catch (e: any) {
        console.error("Upload error", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
