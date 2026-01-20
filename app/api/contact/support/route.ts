import { NextResponse } from "next/server";
import { createServerClient } from "@/app/lib/supabase/server";
// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const supabase = await createServerClient();
        const body = await request.json();
        const { name, email, topic, message } = body;

        // Validation
        if (!name || !email || !message) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Save to Supabase
        const { error: dbError } = await supabase
            .from('support_requests')
            .insert({ name, email, topic, message });

        if (dbError) {
            console.error("Supabase support_requests Insert Error:", dbError);
            // We might still want to try sending email even if DB fails, or fail hard.
            // For now, let's log and continue, or fail if critical. 
            // Usually we want at least one record.
        }

        // 2. Send Email Notification
        const emailContent = `
Uus kasutaja tugipalve:
Nimi: ${name}
E-post: ${email}
Teema: ${topic || 'Määramata'}

Sõnum:
${message}
        `;

        console.log("[Support] Processing request:", { name, email, topic });
        console.log("[Support] Notification Content:\n", emailContent);

        // if (process.env.RESEND_API_KEY) {
        //     await resend.emails.send({
        //         from: 'SmartBuild Support <onboarding@resend.dev>',
        //         to: process.env.SUPPORT_INBOX_EMAIL || 'info@smartbuild.ee',
        //         reply_to: email,
        //         subject: `Support: ${topic} - ${name}`,
        //         text: emailContent,
        //     });
        // }

        // Simulate network delay
        await new Promise(r => setTimeout(r, 500));

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Support API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
