import { NextResponse } from "next/server";
import { PRODUCTS } from "@/app/lib/mockData";

export async function GET() {
    // Return mock data directly
    return NextResponse.json({ items: PRODUCTS });
}