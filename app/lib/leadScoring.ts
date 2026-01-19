
export interface LeadScoreResult {
    score: number;
    tier: 'hot' | 'warm' | 'cold';
    reason: string[];
}

export type PartnerType = 'store' | 'wholesaler' | 'manufacturer' | 'logistics' | 'other';

interface LeadInput {
    partnerType: string;
    apiReadiness: string; // 'Yes', 'No', or 'Partial'
    city: string;
    companyName?: string;
}

export function calculateLeadScore(input: LeadInput): LeadScoreResult {
    let score = 0;
    const reasons: string[] = [];

    // 1. Partner Type (Max 40 pts)
    const type = input.partnerType?.toLowerCase() as PartnerType;
    if (['store', 'wholesaler'].includes(type)) {
        score += 40;
        reasons.push('High value partner type (Store/Wholesaler)');
    } else if (['manufacturer'].includes(type)) {
        score += 30;
        reasons.push('Strategic partner (Manufacturer)');
    } else {
        score += 10;
        reasons.push('Standard partner type');
    }

    // 2. API Readiness (Max 30 pts)
    const apiReady = input.apiReadiness?.toLowerCase() || 'no';
    if (apiReady.includes('yes')) {
        score += 30;
        reasons.push('API Ready (Technical maturity)');
    } else if (apiReady.includes('product feed') || apiReady.includes('csv')) {
        score += 20;
        reasons.push('Has Data Feed (Partial tech readiness)');
    } else {
        score += 5; // Minimal points for contact
    }

    // 3. Location / Strategic Cities (Max 20 pts)
    const city = input.city?.toLowerCase() || '';
    if (['tallinn', 'tartu', 'pärnu', 'narva'].some(c => city.includes(c))) {
        score += 20;
        reasons.push('Key Strategic City');
    } else {
        score += 10;
    }

    // 4. Data Completeness (Max 10 pts)
    if (input.companyName && input.city && input.partnerType) {
        score += 10;
        reasons.push('Complete Profile');
    }

    // Cap at 100
    score = Math.min(score, 100);

    // Determine Tier
    let tier: 'hot' | 'warm' | 'cold' = 'cold';
    if (score >= 70) tier = 'hot';
    else if (score >= 40) tier = 'warm';

    return {
        score,
        tier,
        reason: reasons
    };
}
