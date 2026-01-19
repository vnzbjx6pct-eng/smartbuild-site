
export interface CategorizationResult {
    category: string;
    subcategory: string;
    confidence: number;
    reason: string;
}

const CATEGORY_RULES: Record<string, { category: string; subcategory: string; keywords: string[] }> = {
    // Construction Materials
    cement: {
        category: 'construction',
        subcategory: 'concrete',
        keywords: ['cement', 'tsement', 'betoon', 'segu', 'mört', 'mortar']
    },
    drywall: {
        category: 'construction',
        subcategory: 'drywall',
        keywords: ['kips', 'gypsum', 'plaat', 'knauf', 'gyproc']
    },
    insulation: {
        category: 'construction',
        subcategory: 'insulation',
        keywords: ['vill', 'wool', 'peno', 'eps', 'xps', 'isover', 'paroc', 'insulation']
    },
    wood: {
        category: 'construction',
        subcategory: 'timber',
        keywords: ['puit', 'wood', 'laud', 'pruss', 'timber', 'fassaadilaud', 'terrassilaud']
    },

    // Finishing
    paint: {
        category: 'finishing',
        subcategory: 'paints',
        keywords: ['värv', 'paint', 'krunt', 'primer', 'sadolin', 'tikkurila', 'viva']
    },
    tiles: {
        category: 'finishing',
        subcategory: 'tiles',
        keywords: ['plaat', 'tile', 'keraamiline', 'mosaiik', 'marmor']
    },

    // Roofing
    roofing: {
        category: 'roofing',
        subcategory: 'general',
        keywords: ['katus', 'roof', 'plekk', 'kivi', 'bituumen', 'sindel']
    },

    // Tools
    tools: {
        category: 'tools',
        subcategory: 'general',
        keywords: ['tööriist', 'tool', 'vasar', 'saag', 'trell', 'drill', 'saw', 'hammer']
    },

    // Plumbing
    plumbing: {
        category: 'plumbing',
        subcategory: 'pipes',
        keywords: ['toru', 'pipe', 'pvc', 'liitmik', 'fitting', 'wc', 'segisti', 'faucet']
    },

    // Electrical
    electrical: {
        category: 'electrical',
        subcategory: 'cables',
        keywords: ['kaabel', 'cable', 'juhe', 'wire', 'lüliti', 'switch', 'pistik', 'socket']
    }
};

export function categorizeProduct(product: { name: string; description?: string; category?: string }): CategorizationResult {
    const text = `${product.name} ${product.description || ''} ${product.category || ''}`.toLowerCase();

    // 1. Direct Rule Matching
    for (const ruleKey in CATEGORY_RULES) {
        const rule = CATEGORY_RULES[ruleKey];
        if (rule.keywords.some(kw => text.includes(kw))) {
            return {
                category: rule.category,
                subcategory: rule.subcategory,
                confidence: 0.9,
                reason: `Matched keyword rule: ${ruleKey}`
            };
        }
    }

    // 2. Heuristics / Fallback (MVP: Just catch-all)
    // Future: Call AI here if confidence < 0.8

    return {
        category: 'other',
        subcategory: 'uncategorized',
        confidence: 0.1,
        reason: 'No keywords matched'
    };
}
