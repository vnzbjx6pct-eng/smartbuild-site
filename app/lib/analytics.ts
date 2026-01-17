"use client";
import { track as vercelTrack } from "@vercel/analytics";

type EventName =
    | "view_home"
    | "view_catalog"
    | "view_product"
    | "add_to_cart"
    | "start_rfq"
    | "submit_rfq"
    | "rfq_success"
    | "hero_primary_cta_click"
    | "hero_secondary_cta_click"
    | "search_focus"
    | "search_input_started"
    | "search_submit"
    | "empty_state_shown"
    | "empty_state_cta_click"
    | "empty_state_search_refine"
    | "empty_state_rfq_started"
    | "add_to_cart_success"
    | "toast_primary_click"
    | "toast_secondary_click"
    | "mobile_search_started"
    | "mobile_add_to_cart"
    | "mobile_rfq_started"
    | "mobile_rfq_completed"
    | "trust_block_viewed"
    | "rfq_started_after_trust";

type EventProperties = Record<string, string | number | boolean>;

/**
 * Safe analytics tracker for Vercel Analytics.
 * Works in production. Logs to console in development.
 * Never throws.
 */
export function track(eventName: EventName, properties?: EventProperties) {
    try {
        if (process.env.NODE_ENV === "development") {
            const propStr = properties ? JSON.stringify(properties) : "";
            console.log(`[Analytics] ${eventName} ${propStr}`);
            return;
        }

        vercelTrack(eventName, properties);
    } catch (err) {
        // Silently fail to avoid affecting UX
        // In dev, we can log it
        if (process.env.NODE_ENV === "development") {
            console.warn("[Analytics] Tracking failed:", err);
        }
    }
}
