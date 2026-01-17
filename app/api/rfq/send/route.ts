import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { CONTACTS_BY_CITY, DEFAULT_CONTACTS, StoreName, CityName } from "@/app/lib/storeContacts";
import { routeRFQ } from "@/app/lib/routingEngine";
import { PARTNERS } from "@/app/lib/partners";

// Rate Limiting (In-Memory)
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const requestLog = new Map<string, number>();

function getIp(req: Request) {
    const forwarded = req.headers.get("x-forwarded-for");
    return forwarded ? forwarded.split(",")[0] : "127.0.0.1";
}

export async function POST(request: Request) {
    try {
        const ip = getIp(request);
        const now = Date.now();

        // 1. Rate Limiting
        const lastRequest = requestLog.get(ip) || 0;
        if (now - lastRequest < RATE_LIMIT_WINDOW) {
            return NextResponse.json({ error: "Palun oodake 1 minut enne uue päringu saatmist." }, { status: 429 });
        }
        requestLog.set(ip, now);

        // 2. Parse Body
        const body = await request.json();
        const {
            name,
            email,
            phone,
            city,
            selectedStores,
            cartItems,
            consent,
            notes,
            customerType // [NEW] Soft segmentation
        } = body;

        // Map customerType to readable text
        const customerTypeLabel = {
            'private': 'Eraisik',
            'builder': 'Ehitaja',
            'company': 'Ettevõte'
        }[customerType as string] || 'Määramata';

        // 3. Validation
        if (!email || !city || !cartItems || cartItems.length === 0 || !selectedStores || selectedStores.length === 0) {
            return NextResponse.json({ error: "Palun täitke kohustuslikud väljad." }, { status: 400 });
        }
        if (!consent) {
            return NextResponse.json({ error: "Palun kinnitage nõusolek andmete edastamiseks." }, { status: 400 });
        }

        // 4. Nodemailer Transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.example.com",
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER || "user",
                pass: process.env.SMTP_PASS || "pass",
            },
        });

        // 5. Generate Email Content
        const productRows = cartItems.map((item: { name: string; qty: number; unit?: string }) => {
            return `- ${item.name}: ${item.qty} ${item.unit || 'tk'}`;
        }).join("\n");



        // 6. Send to selected stores (B2B)
        const sentTo: string[] = [];
        const errors: string[] = [];

        // Prepare User Email Content
        const userEmailSubject = `Sinu hinnapäring on saadetud - SmartBuild`;
        const userEmailBody = `Tere, ${name || "klient"}!

Sinu hinnapäring on edukalt edastatud.
Oled valinud järgmised poed: ${selectedStores.join(", ")}.

Päringu sisu:
${productRows}

Linn: ${city}

Poed vaatavad päringu üle ja vastavad sulle otse e-posti teel (${email}) tavaliselt 24h jooksul.

Edukaid oste soovides,
SmartBuild Eesti meeskond`;

        // Check if SMTP is configured (simple check)
        const isSmtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER;

        console.log(`[RFQ] Processing for City: ${city}, Stores: ${selectedStores.join(", ")}`);

        // --- A. SEND TO USER (Confirmation) ---
        if (!isSmtpConfigured) {
            console.log(`[EMAIL][DRY RUN] ---------------------------------------------------`);
            console.log(`[EMAIL][DRY RUN] To USER: ${email}`);
            console.log(`[EMAIL][DRY RUN] Subject: ${userEmailSubject}`);
            console.log(`[EMAIL][DRY RUN] Body: \n${userEmailBody}`);
            console.log(`[EMAIL][DRY RUN] ---------------------------------------------------`);
        } else {
            try {
                await transporter.sendMail({
                    from: process.env.SMTP_FROM || '"SmartBuild" <noreply@smartbuild.ee>',
                    to: email,
                    subject: userEmailSubject,
                    text: userEmailBody,
                });
                console.log(`[Email] Confirmation sent to user ${email}`);
            } catch (err) {
                console.error(`[Email Error] Failed to send confirmation to user:`, err);
                // We don't fail the whole request if user email fails, but it's bad.
            }
        }

        // --- B. SEND TO STORES (B2B) ---
        for (const storeName of selectedStores) {

            // NEW: Routing Engine
            const routingResult = routeRFQ(city, storeName);

            let storeEmail = routingResult?.destinationEmail;
            let recipientName = routingResult?.targetName || storeName;

            // Fallback (Final Safety Net)
            if (!storeEmail) {
                console.warn(`[RFQ] Routing failed for ${storeName} in ${city}. Using global default.`);
                storeEmail = DEFAULT_CONTACTS[storeName as StoreName];
            }

            if (!storeEmail) {
                console.warn(`[RFQ] CRITICAL: No email found for ${storeName}. Skipping.`);
                errors.push(storeName);
                continue;
            }

            console.log(`[RFQ] Dispatching to ${recipientName} (${storeEmail})`);

            // PARTNER LOGIC (Paid Leads)
            const partnerConfig = PARTNERS[storeName as StoreName];
            const isPaidLead = partnerConfig?.leadType === "paid";
            const baseLeadPrice = partnerConfig?.leadPrice || 0;

            // Volume Logic (Lead Qualification)
            const itemCount = cartItems.length;
            let volumeTag = "[SMALL]";
            let volumeMultiplier = 1.0;

            if (itemCount >= 20) {
                volumeTag = "[LARGE]";
                volumeMultiplier = 1.5; // Large orders are worth more
            } else if (itemCount >= 5) {
                volumeTag = "[MEDIUM]";
                volumeMultiplier = 1.2;
            }

            // Calculate Estimated Revenue
            const leadValue = isPaidLead ? (baseLeadPrice * volumeMultiplier) : 0;
            const leadTag = isPaidLead ? "[LEAD][PAID]" : "[LEAD][FREE]";

            // Log full qualification and revenue
            // [REVENUE] tag is important for internal analytics (grep)
            console.info(`${leadTag}${volumeTag} Store: ${storeName}, City: ${city}, Items: ${itemCount}, Type: ${customerTypeLabel}, Val: €${leadValue.toFixed(2)} [REVENUE:${leadValue.toFixed(2)}]`);

            // @TODO: Integrate analytics event here (e.g. Mixpanel)
            // @TODO: Add payment gateway logic for [LEAD][PAID] in future

            const storeSubject = `SmartBuild Hinnapäring: ${city} - ${itemCount} toodet (${customerTypeLabel})`;
            // More business-like body for stores
            const storeBody = `Tere!

SmartBuild keskkonnast on saabunud uus hinnapäring.

PALUN SAATKE PAKKUMINE KLIENDILE:
Nimi: ${name || "Eraisik"}
E-post: ${email}
Telefon: ${phone || "-"}
Ettevõte: ${body.company || "-"}
Kliendi tüüp: ${customerTypeLabel}
Linn: ${city}

TOOTED:
${productRows}

LISAINFO:
${notes || "-"}

Palun vastake otse kliendile (${email}).
SmartBuild`;

            if (!isSmtpConfigured) {
                // DRY RUN
                console.log(`[EMAIL][DRY RUN] ---------------------------------------------------`);
                console.log(`[EMAIL][DRY RUN] To STORE: ${storeName} <${storeEmail}>`);
                console.log(`[EMAIL][DRY RUN] Subject: ${storeSubject}`);
                console.log(`[EMAIL][DRY RUN] Reply-To: ${email}`);
                console.log(`[EMAIL][DRY RUN] Body: \n${storeBody}`);
                console.log(`[EMAIL][DRY RUN] ---------------------------------------------------`);
                sentTo.push(storeName);
                continue;
            }

            // REAL SEND
            try {
                console.log(`[Email] Sending to ${storeName} (${storeEmail})...`);
                await transporter.sendMail({
                    from: process.env.SMTP_FROM || '"SmartBuild" <noreply@smartbuild.ee>',
                    to: storeEmail,
                    replyTo: email, // Critical for B2B
                    subject: storeSubject,
                    text: storeBody,
                });
                sentTo.push(storeName);
            } catch (err) {
                console.error(`[Email Error] Failed to send to ${storeName}:`, err);
                errors.push(storeName);
            }
        }

        if (sentTo.length === 0 && errors.length > 0) {
            return NextResponse.json({ error: "Kirjade saatmine ebaõnnestus." }, { status: 500 });
        }

        // [FUTURE INTEGRATION POINT]
        // Parallel to success response, we can emit an event or call a Webhook
        // to sync this lead with the Partner's CRM (e.g. Pipedrive/Hubspot).
        // await syncToCRM(body, sentTo);

        return NextResponse.json({ success: true, sentTo });

    } catch (error) {
        console.error("RFQ Send Error:", error);
        return NextResponse.json({ error: "Serveri viga päringu töötlemisel." }, { status: 500 });
    }
}
