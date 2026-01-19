
import { categorizeProduct } from "@/app/lib/categorization";

// 1. Raw Row from CSV (String Key-Value pairs)
export type PartnerCsvRowRaw = Record<string, string | undefined>;

// 2. Normalized Product Draft
export interface PartnerProductDraft {
    product_name: string;
    category: string;
    subcategory: string;
    price: number;
    stock: number;
    delivery_days: number;
    description: string;
    sku?: string;
    ean?: string;

    // Auto-categorized
    auto_category?: string;
    auto_subcategory?: string;
    confidence?: string;

    // Original validation context
    _originalRowIndex?: number;
}

// 3. Error Structure
export interface CsvRowError {
    row: number;
    column?: string;
    message: string;
    rawData?: PartnerCsvRowRaw;
}

// 4. Parse Result
export interface CsvParseResult {
    rows: PartnerProductDraft[];
    errors: CsvRowError[];
}

/**
 * Normalizes a single raw CSV row into a typed draft.
 */
export function normalizeCsvRow(row: PartnerCsvRowRaw, rowIndex: number): { value?: PartnerProductDraft; error?: CsvRowError } {
    // 1. Required Fields
    const name = row['product_name']?.trim() || row['name']?.trim();
    if (!name) {
        return { error: { row: rowIndex, column: 'product_name', message: 'Missing product name', rawData: row } };
    }

    // 2. Price Parsing
    const priceRaw = row['price']?.trim();
    const price = priceRaw ? parseFloat(priceRaw.replace(',', '.')) : 0;
    if (isNaN(price) || price < 0) {
        return { error: { row: rowIndex, column: 'price', message: 'Invalid price format', rawData: row } };
    }

    // 3. Stock Parsing
    const stockRaw = row['stock']?.trim();
    const stock = stockRaw ? parseInt(stockRaw, 10) : 0; // Default to 0 if missing? Or error? Let's default 0 for MVP

    // 4. Delivery Days
    const daysRaw = row['delivery_days']?.trim();
    const deliveryDays = daysRaw ? parseInt(daysRaw, 10) : 3; // Default 3 days

    const description = row['description']?.trim() || '';
    const categoryRaw = row['category']?.trim() || '';
    const subcategoryRaw = row['subcategory']?.trim() || '';
    const sku = row['sku']?.trim();
    const ean = row['ean']?.trim();

    // 5. Auto Categorization
    const catResult = categorizeProduct({
        name,
        category: categoryRaw,
        description
    });

    return {
        value: {
            product_name: name,
            category: categoryRaw,
            subcategory: subcategoryRaw,
            price,
            stock,
            delivery_days: deliveryDays,
            description,
            sku,
            ean,
            auto_category: catResult.category,
            auto_subcategory: catResult.subcategory,
            confidence: Math.round(catResult.confidence * 100) + '%',
            _originalRowIndex: rowIndex
        }
    };
}
