import { StoreName } from "./stores";

export type PartnerTier = "free" | "partner" | "premium";
export type LeadType = "free" | "paid";

export interface PartnerConfig {
    tier: PartnerTier;
    leadType: LeadType;
    affiliateParam?: string; // e.g. "?ref=smartbuild"
    leadPrice?: number; // EUR per qualified lead
}

export const PARTNER_PLANS = {
    free: {
        name: "Basic",
        price: 0,
        features: ["Standard Routing", "Limited RFQs", "Email Support"],
        leadPrice: 0,
    },
    partner: {
        name: "Pro",
        price: 49, // Monthly fee (example)
        features: ["Priority Routing", "Unlimited RFQs", "Priority Support", "Analytics Dashboard"],
        leadPrice: 5, // EUR per lead
    },
    premium: {
        name: "Enterprise",
        price: "Custom",
        features: ["City Exclusivity", "API Integration", "Dedicated Manager", "Custom Reporting"],
        leadPrice: 10, // EUR per lead (higher quality/exclusive)
    }
};

export const PARTNERS: Record<StoreName, PartnerConfig> = {
    // Model A + C: Premium Partners (Paid Leads + Affiliate)
    "Bauhof": {
        tier: "premium",
        leadType: "paid",
        affiliateParam: "?ref=smartbuild_premium",
        leadPrice: 10.0,
    },
    // Model A: Standard Partners (Paid Leads, no special affiliate)
    "Decora": {
        tier: "partner",
        leadType: "paid",
        affiliateParam: "?utm_source=smartbuild",
        leadPrice: 5.0,
    },
    // Free Tier
    "Espak": { tier: "free", leadType: "free", leadPrice: 0 },
    "K-Rauta": { tier: "free", leadType: "free", leadPrice: 0 },
    "Ehituse ABC": { tier: "free", leadType: "free", leadPrice: 0 },
    "Karl Bilder": { tier: "free", leadType: "free", leadPrice: 0 },
};

export function getPartnerConfig(store: string): PartnerConfig {
    return PARTNERS[store as StoreName] || { tier: "free", leadType: "free", leadPrice: 0 };
}
