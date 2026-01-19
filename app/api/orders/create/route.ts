import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use Service Role for safe DB writes (bypassing RLS for creation if needed, or ensuring strict ownership)
// Actually, for inserting user order, standard Authenticated client is safer for RLS.
// BUT, creating complex nested relations (Order -> Items -> Shipments) often runs into RLS issues 
// if policies are not perfect for "insert related".
// Plan: Verify user auth via header, then use ADMIN client to do the transactional write, 
// ensuring we force `user_id` to be the authenticated user's ID.

// Lazy init inside handler to prevent build errors
const getSupabaseAdmin = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { items, totals, delivery, userDetails } = body;
        // items: { id, productId, name, price, quantity, ... }[]
        // totals: { subtotal, delivery, total }
        // delivery: { method: 'wolt'|'pickup', split?: boolean, woltItems: [], otherItems: [] }
        // userDetails: { city, address, phone, notes }

        // 1. Auth Check
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const token = authHeader.replace("Bearer ", "");
        const supabaseAdmin = getSupabaseAdmin();
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // 2. Validate inputs (basic)
        if (!items || items.length === 0) return NextResponse.json({ error: "Empty cart" }, { status: 400 });

        // 3. Create Order
        const { data: order, error: orderError } = await supabaseAdmin
            .from("orders")
            .insert({
                user_id: user.id,
                status: "submitted",
                payment_status: "unpaid",
                subtotal: totals.subtotal,
                delivery_fee: totals.delivery,
                total: totals.total,
                city: userDetails.city,
                address_line: userDetails.address,
                phone: userDetails.phone,
                notes: userDetails.notes
            })
            .select("id")
            .single();

        if (orderError) throw orderError;

        // 4. Create Shipments
        // Logic: If partial split, create 2 shipments. Else 1.
        const shipmentsToCreate: any[] = [];

        const isSplit = delivery.split === true;

        // Helper to format shipment
        const createShipmentObj = (type: string, fee: number, status: string, itemsForShipment: any[]) => ({
            order_id: order.id,
            type,
            status, // 'pending' or 'preparing'
            city: userDetails.city,
            address_line: userDetails.address,
            fee,
            eta_minutes: type === 'wolt' ? 45 : undefined, // Mock ETA
            items: itemsForShipment
        });

        let shipmentWoltId: string | null = null;
        let shipmentOtherId: string | null = null;
        let shipmentWolt: any = null;
        let shipmentOther: any = null;

        if (isSplit) {
            // Shipment 1: Wolt
            shipmentWolt = await supabaseAdmin.from("shipments").insert({
                ...createShipmentObj('wolt', delivery.woltFee || 0, 'pending', []),
                provider: 'wolt'
            }).select("id").single();
            if (shipmentWolt.error) throw shipmentWolt.error;
            shipmentWoltId = shipmentWolt.data.id;

            // Shipment 2: Store/Pickup
            // If user originally wanted Wolt but got split, the rest is Pickup usually? 
            // Or Store Delivery if configured. Let's assume Pickup for MVP fallback or Store Delivery if "Partial Delivery" implies store brings it.
            // Requirement says: "if partial split — create 2 shipments (wolt + store/pickup)"
            // Let's assume 'pickup' for the heavy stuff if not specified.
            const secondaryType = delivery.secondaryMethod || 'pickup';
            shipmentOther = await supabaseAdmin.from("shipments").insert({
                ...createShipmentObj(secondaryType, 0, 'pending', [])
            }).select("id").single();
            if (shipmentOther.error) throw shipmentOther.error;
            shipmentOtherId = shipmentOther.data.id;

        } else {
            // Single Shipment
            shipmentOther = await supabaseAdmin.from("shipments").insert({
                ...createShipmentObj(delivery.method, totals.delivery, 'pending', []),
                provider: delivery.method === 'wolt' ? 'wolt' : null
            }).select("id").single();
            if (shipmentOther.error) throw shipmentOther.error;
            shipmentOtherId = shipmentOther.data.id;
        }

        // 5. Create Order Items
        // We need to map items to shipment IDs
        const dbItems = items.map((i: any) => {
            let shipment_id = shipmentOtherId;

            // If split, check if this item is in woltItems list
            if (isSplit && delivery.woltItems?.includes(i.id)) {
                shipment_id = shipmentWoltId;
            }

            return {
                order_id: order.id,
                product_id: i.productId || i.id, // Fallback
                name: i.name,
                brand: i.brand,
                qty: i.quantity,
                unit: i.unit,
                price: i.price,
                line_total: i.price * i.quantity,
                image_url: i.image,
                shipment_id
            };
        });

        const { error: itemsError } = await supabaseAdmin.from("order_items").insert(dbItems);
        if (itemsError) throw itemsError;

        return NextResponse.json({ success: true, orderId: order.id });

    } catch (e: any) {
        console.error("Order create error", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
