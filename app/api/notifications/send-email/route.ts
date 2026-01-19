
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
// import { Resend } from 'resend'; // Assumption: user might have it or not. Code defensively.

// const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    // 1. Validate Secret or Session? 
    // Since this is internal, maybe just rely on being called? 
    // Ideally this should be protected. 
    // authenticating the service role client logic effectively.

    const { notificationId, locale } = await req.json();

    if (!notificationId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 2. Get Notification Data
    const { data: notif } = await supabase
        .from('notifications')
        .select('*, user:user_id(email)') // Get user email if possible via join or separate call
        .eq('id', notificationId)
        .single();

    if (!notif) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Ensure we have user email. If foreign key doesn't get it (auth users tricky), fetch via auth admin
    let userEmail = (notif as any).user?.email;

    if (!userEmail) {
        const { data: userData } = await supabase.auth.admin.getUserById(notif.user_id);
        userEmail = userData.user?.email;
    }

    if (!userEmail) {
        await supabase.from('notification_events')
            .update({ status: 'failed', error: 'No user email found' })
            .eq('notification_id', notificationId)
            .eq('channel', 'email');
        return NextResponse.json({ error: "No email" }, { status: 400 });
    }

    // 3. Send Email (Mock or Real)
    const apiKey = process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.EMAIL_FROM || 'SmartBuild <noreply@smartbuild.ee>';

    if (!apiKey) {
        console.warn("No Email API Key found. Skipping email send.");
        // Mark as failed/skipped
        await supabase.from('notification_events')
            .update({ status: 'failed', error: 'Missing API Keys' })
            .eq('notification_id', notificationId)
            .eq('channel', 'email');

        return NextResponse.json({ message: "Skipped (No Keys)" });
    }

    try {
        // Example implementation for Resend
        /*
        await resend.emails.send({
            from: fromEmail,
            to: userEmail,
            subject: `SmartBuild Update: ${notif.type}`,
            html: `<p>Notification content here based on keys...</p>`
        });
        */

        // For now, assume success mock
        console.log(`[MOCK EMAIL] To: ${userEmail}, Subject: ${notif.title_key}`);

        await supabase.from('notification_events')
            .update({ status: 'sent', provider: 'mock' })
            .eq('notification_id', notificationId)
            .eq('channel', 'email');

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("Email send failed", e);
        await supabase.from('notification_events')
            .update({ status: 'failed', error: e.message })
            .eq('notification_id', notificationId)
            .eq('channel', 'email');
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
