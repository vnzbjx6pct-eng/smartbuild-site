import { NextResponse } from "next/server";
import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY); 
// NOTE: Since I don't have the user's API key, I will mock the success but simulate the logic.
// If the user adds API key later, they can uncomment.

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, phone, city, company, notes, cartItems } = body;

        // Validate
        if (!name || !email || !city || !cartItems || cartItems.length === 0) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Determine recipients based on city
        // Mock addresses for demo
        const recipients = [
            `espak.${city.toLowerCase()}@example.com`,
            `bauhof.${city.toLowerCase()}@example.com`,
            `krauta.${city.toLowerCase()}@example.com`
        ];

        console.log(`[RFQ] Processing request for ${city}`);
        console.log(`[RFQ] Recipients: ${recipients.join(", ")}`);

        // 2. Generate Email Content (Simple Text/HTML)
        const itemsList = cartItems.map((i: any) => `- ${i.name}: ${i.qty} ${i.unit || 'tk'}`).join("\n");

        const emailContent = `
      Uus hinnapäring saidilt SmartBuild!
      
      Klient: ${name}
      Ettevõte: ${company || "-"}
      E-post: ${email}
      Telefon: ${phone}
      Linn: ${city}
      Lisainfo: ${notes || "-"}
      
      Soovitud tooted:
      ${itemsList}
      
      Palun vastake otse kliendile aadressil ${email}.
    `;

        console.log("[RFQ] Email Content Logic Prepared:\n", emailContent);

        // 3. Send Email (Mocking Resend for now to ensure no crash without key)
        // await resend.emails.send({
        //   from: 'SmartBuild <onboarding@resend.dev>',
        //   to: recipients,
        //   subject: `Hinnapäring: ${name} - ${city}`,
        //   text: emailContent,
        // });

        // Simulate delay
        await new Promise(r => setTimeout(r, 1000));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("RFQ Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
