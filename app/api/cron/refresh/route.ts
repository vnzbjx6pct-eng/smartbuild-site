import { NextResponse } from 'next/server';

export async function GET() {
    // Stub for scheduled price updates
    // In future: Fetch prices from store websites (scraping/API) and update 'offers' table

    console.log("Cron job triggered: Refreshing prices (STUB)");

    return NextResponse.json({
        success: true,
        message: "Price refresh job simulation completed."
    });
}
