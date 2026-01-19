import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseServer";
import { calculateLeadScore } from "@/app/lib/leadScoring";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            company_name,
            contact_name,
            email,
            phone,
            city,
            partner_type,
            api_readiness
        } = body;

        // Validation
        if (!company_name || !contact_name || !email || !city || !partner_type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Calculate Lead Score
        const scoring = calculateLeadScore({
            partnerType: partner_type,
            apiReadiness: api_readiness,
            city: city,
            companyName: company_name
        });

        // 1. Save to Supabase
        const { error: dbError } = await supabase
            .from('partners_contacts')
            .insert({
                company_name,
                contact_name,
                email,
                phone,
                city,
                partner_type,
                api_readiness: api_readiness || 'No',
                status: 'new',

                // Lead Scoring
                lead_score: scoring.score,
                lead_tier: scoring.tier,
                lead_score_reason: scoring.reason
            });

        if (dbError) {
            console.error("Supabase partners_contacts Insert Error:", dbError);
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }

        // 2. Log for now (Email mock)
        console.log("[Partners] New B2B Lead:", { company_name, city, partner_type });

        // Simulate network delay
        await new Promise(r => setTimeout(r, 500));

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Partner API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
