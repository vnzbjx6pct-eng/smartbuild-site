import { DeliveryReasonCode, DeliverySeverity, DeliveryAction, REASON_SEVERITY, REASON_ACTION } from "./reasonCodes";
import type { Order, Shipment} from "@/app/lib/types";
import { ShipmentEvent } from "@/app/lib/types";

export interface DeliveryUXState {
    severity: DeliverySeverity;
    titleKey: string;
    descriptionKey: string;
    action: DeliveryAction;
    showCard: boolean;
    reasonCode?: DeliveryReasonCode;
    meta?: any;
}

// SLA Thresholds in milliseconds
const SLA_THRESHOLDS = {
    PENDING: 30 * 60 * 1000, // 30 mins
    PREPARING: 2 * 60 * 60 * 1000, // 2 hours
    DISPATCHED_NO_ETA: 2 * 60 * 60 * 1000, // 2 hours
    ETA_OVERDUE: 30 * 60 * 1000 // 30 mins
};

export function getDeliveryUXState(order: Order, shipments: Shipment[]): DeliveryUXState {
    // 0. Default State (Happy Path)
    const state: DeliveryUXState = {
        severity: DeliverySeverity.INFO,
        titleKey: "delivery.ux.status.normal.title",
        descriptionKey: "delivery.ux.status.normal.desc",
        action: DeliveryAction.NONE,
        showCard: false
    };

    if (!shipments || shipments.length === 0) return state;

    // 1. Find the most critical shipment (based on priority/severity)
    // We prioritize "active" problems over completed ones, unless everything is failed.

    // Sort shipments by "badness"
    const activeShipments = shipments.filter(s => s.status !== 'delivered' && s.status !== 'cancelled');

    // If all delivered, show success? Or just hide card (logic says hide unless eta changes etc)
    if (activeShipments.length === 0) {
        // Check if there was a problem recently? For now, if all delivered, we are good.
        // Exception: Partial delivery where one part is later?
        return { ...state, severity: DeliverySeverity.SUCCESS, showCard: false };
    }

    // Logic: finding the single most important reason
    // Use the getReasonPriority from reasonCodes.ts logic implicitly via manual checks or reuse
    // Here we define a custom finder.

    let criticalShipment: Shipment | null = null;
    let criticalReason: DeliveryReasonCode | null = null;

    // A) Check for Explicit Reason Codes in active shipments
    for (const s of activeShipments) {
        if (s.status_reason_code) {
            const code = s.status_reason_code as DeliveryReasonCode;
            // If we found one, and it's "worse" or same, take it.
            // We can use severity comparison. ACTION > ERROR > WARNING > INFO
            if (!criticalReason) {
                criticalReason = code;
                criticalShipment = s;
            } else {
                const currentSev = REASON_SEVERITY[criticalReason];
                const newSev = REASON_SEVERITY[code];
                if (getSeverityWeight(newSev) > getSeverityWeight(currentSev)) {
                    criticalReason = code;
                    criticalShipment = s;
                }
            }
        }
    }

    // B) SLA Checks (if no explicit critical reason found yet OR if SLA breach is severe)
    // If we have an explicit reason, we usually use that. SLA breaches are for "UNKNOWN" causes.
    if (!criticalReason) {
        const now = new Date().getTime();
        for (const s of activeShipments) {
            const createdAt = new Date(s.created_at).getTime();
            const status = s.status;
            let breach = false;

            if (status === 'pending' && (now - createdAt > SLA_THRESHOLDS.PENDING)) breach = true;
            else if (status === 'preparing' && (now - createdAt > SLA_THRESHOLDS.PREPARING)) breach = true;
            // CHECK ETA
            if (s.eta_minutes) {
                // Approximate calc
                const etaTime = createdAt + s.eta_minutes * 60000;
                if (now > etaTime + SLA_THRESHOLDS.ETA_OVERDUE) breach = true;
            }

            if (breach) {
                criticalReason = DeliveryReasonCode.UNKNOWN;
                criticalShipment = s;
                break; // First breach is enough for now
            }
        }
    }

    // C) Construct State
    if (criticalReason) {
        state.reasonCode = criticalReason;
        state.severity = REASON_SEVERITY[criticalReason];
        state.action = REASON_ACTION[criticalReason];
        state.showCard = true; // By default show card for any reason found

        // Special overrides
        if (criticalReason === DeliveryReasonCode.WEATHER_DELAY) {
            // If ETA not changed significantly, might stay info? 
            // Implementing user rule: info -> warning if ETA changed. 
            // For now assume warning to be safe if code acts up.
            if (state.severity === DeliverySeverity.INFO) state.severity = DeliverySeverity.WARNING;
        }

        state.titleKey = `delivery.ux.${criticalReason}.title`;
        state.descriptionKey = `delivery.ux.${criticalReason}.description`;
    }

    // D) Hide card if everything is actually fine and reason is just INFO?
    // User rule: "Poaskazat reason-kartochku TOLKO esli..."
    // If severity is INFO and current status is progressing, maybe hide?
    // But our Info codes (Weather, Customer Reschedule) imply a deviation.
    // So we keep showCard = true for them.

    return state;
}

function getSeverityWeight(sev: DeliverySeverity): number {
    switch (sev) {
        case DeliverySeverity.ACTION_REQUIRED: return 4;
        case DeliverySeverity.ERROR: return 3;
        case DeliverySeverity.WARNING: return 2;
        case DeliverySeverity.INFO: return 1;
        default: return 0;
    }
}
