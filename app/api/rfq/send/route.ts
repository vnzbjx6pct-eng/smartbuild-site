import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { CONTACTS_BY_CITY, DEFAULT_CONTACTS, StoreName, CityName } from "@/app/lib/storeContacts";

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
            notes
        } = body;

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
        const productRows = cartItems.map((item: any) => {
            return `- ${item.name}: ${item.qty} ${item.unit || 'tk'}`;
        }).join("\n");

        const emailBody = `Tere!
Soovin hinnapakkumist järgmistele ehitusmaterjalidele:

${productRows}

Kliendi andmed:
Nimi: ${name || "Nimetu"}
E-post: ${email}
Telefon: ${phone || "-"}
Linn: ${city}
Lisainfo: ${notes || "-"}

Palun saatke pakkumine otse kliendi e-postile (${email}).
Aitäh!
SmartBuild`;

        // 6. Send to selected stores
        const sentTo: string[] = [];
        const errors: string[] = [];

        // Check if SMTP is configured (simple check)
        const isSmtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER;

        console.log(`[RFQ] Processing for City: ${city}, Stores: ${selectedStores.join(", ")}`);

        for (const storeName of selectedStores) {
            // 1. Try Specific City Contact
            // 2. Fallback to Default (if exists)
            // 3. Fallback to None
            const cityContacts = CONTACTS_BY_CITY[city as CityName];
            let storeEmail = cityContacts?.[storeName as StoreName];

            if (!storeEmail) {
                // Fallback
                storeEmail = DEFAULT_CONTACTS[storeName as StoreName];
            }

            if (!storeEmail) {
                console.warn(`[RFQ] No email found for ${storeName} in ${city} or defaults.`);
                errors.push(storeName);
                continue;
            }

            if (!isSmtpConfigured) {
                // DRY RUN
                console.log(`[DRY RUN] Would send email to: ${storeName} <${storeEmail}>`);
                console.log(`[DRY RUN] Subject: Hinnapäring (SmartBuild) — ${city}`);
                console.log(`[DRY RUN] Body snippet: ${productRows.substring(0, 50)}...`);
                sentTo.push(storeName); // Pretend success
                continue;
            }

            // REAL SEND
            try {
                console.log(`[Email] Sending to ${storeName} (${storeEmail})...`);
                await transporter.sendMail({
                    from: process.env.SMTP_FROM || '"SmartBuild" <noreply@smartbuild.ee>',
                    to: storeEmail,
                    replyTo: email,
                    subject: `Hinnapäring (SmartBuild) — ${city} — ${cartItems.length} toodet`,
                    text: emailBody,
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

        return NextResponse.json({ success: true, sentTo });

    } catch (error) {
        console.error("RFQ Send Error:", error);
        return NextResponse.json({ error: "Serveri viga päringu töötlemisel." }, { status: 500 });
    }
}
