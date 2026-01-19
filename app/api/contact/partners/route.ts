import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseServer";
// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            company_name,
            contact_name,
            email,
            phone,
            partner_type,
            integration_type,
            message
        } = body;

        // Validation
        if (!company_name || !contact_name || !email || !partner_type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Save to Supabase
        const { error: dbError } = await supabase
            .from('partner_requests')
            .insert({
                company_name,
                contact_name,
                email,
                phone,
                partner_type,
                integration_type,
                message
            });

        if (dbError) {
            console.error("Supabase partner_requests Insert Error:", dbError);
        }

        // 2. Send Email Notification
        const emailContent = `
Uus Partnerlus-soov:
Ettevõte: ${company_name}
Kontaktisik: ${contact_name}
E-post: ${email}
Telefon: ${phone || '-'}
Tüüp: ${partner_type}
Integratsioon: ${integration_type || '-'}

Lisainfo:
${message || '-'}
        `;

        console.log("[Partners] Processing request:", { company_name, contact_name });
        console.log("[Partners] Notification Content:\n", emailContent);

        // if (process.env.RESEND_API_KEY) {
        //     await resend.emails.send({
        //         from: 'SmartBuild Partners <onboarding@resend.dev>',
        //         to: process.env.PARTNERS_INBOX_EMAIL || 'partners@smartbuild.ee',
        //         reply_to: email,
        //         subject: `Partner Request: ${company_name}`,
        //         text: emailContent,
        //     });
        // }

        // Simulate network delay
        await new Promise(r => setTimeout(r, 500));

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Partner API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
