
import { supabase } from './supabaseServer';

export type AnalyticsEventName =
    | 'view_home'
    | 'view_product'
    | 'cart_add'
    | 'checkout_start'
    | 'order_placed'
    | 'delivery_check_failed'
    | 'partner_signup_click';

export async function trackEvent(
    eventName: AnalyticsEventName,
    userId?: string,
    properties: Record<string, any> = {}
) {
    try {
        await supabase.from('analytics_events').insert({
            event_name: eventName,
            user_id: userId,
            properties
        });
    } catch (e) {
        console.error("Analytics Error:", e);
        // Fail silently to not block user flow
    }
}

// Aggregation Helpers (SQL Wrappers)

export async function getFunnelStats(startDate: string, endDate: string) {
    // In a real scenario, this would be a complex SQL Group By or multiple queries.
    // For MVP, we'll mock or doing simple counts if table populated.
    // Ideally use Supabase RPC or just Count queries.

    // Pseudo-implementation:
    /*
    const views = await supabase.from('analytics_events').select('*', { count: 'exact' }).eq('event_name', 'view_home');
    const carts = ...
    */

    // Just returning structure for now as per instructions "helpers".
    return {
        views: 0,
        carts: 0,
        checkouts: 0,
        orders: 0
    };
}

export async function getDeliveryRefusals() {
    // Breakdown of 'delivery_check_failed' events by 'reason' property
    return {
        over_weight: 0,
        no_service: 0,
        other: 0
    };
}
