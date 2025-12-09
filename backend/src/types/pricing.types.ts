import { Decimal } from '@prisma/client/runtime/library';

/**
 * Pricing calculation request
 */
export interface PricingCalculationRequest {
    products: ProductPricingInput[];
    expenses: string[]; // Cost IDs
    incoterm: string; // Incoterm name (e.g., 'FOB', 'CIF')
    currency?: string;
    exchangeRate?: number;
}

/**
 * Product input for pricing calculation
 */
export interface ProductPricingInput {
    productId: string;
    quantity: number;
    basePrice?: number; // Optional override of product selling price
}

/**
 * Pricing calculation response
 */
export interface PricingCalculationResponse {
    incoterm: string;
    products: ProductPricingResult[];
    metadata: PricingMetadata;
}

/**
 * Pricing result for a single product
 */
export interface ProductPricingResult {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number; // Final unit price for this Incoterm
    totalPrice: number; // unitPrice * quantity
    breakdown: CostBreakdownItem[];
}

/**
 * Individual cost breakdown item
 */
export interface CostBreakdownItem {
    label: string;
    type: 'product' | 'freight' | 'insurance' | 'fixed' | 'duty' | 'prorated';
    amountPerUnit: number;
    amountTotal: number;
    includedInIncoterm: boolean;
    description?: string;
}

/**
 * Metadata about the calculation
 */
export interface PricingMetadata {
    currency: string;
    precision: number;
    roundingMode: 'HALF_UP' | 'DOWN' | 'UP';
    calculatedAt: Date;
    totalFOB?: number;
    totalCIF?: number;
    totalDEX?: number; // Total export duties
}

/**
 * Internal product data with tariff info
 */
export interface ProductWithTariff {
    id: string;
    sku: string;
    title: string;
    tariffPosition?: {
        id: string;
        code: string;
        adValoremRate?: Decimal;
        fixedExportDuty?: Decimal;
        exportDutyMinAmount?: Decimal;
        exportDutyMaxAmount?: Decimal;
    };
    priceHistory: Array<{
        type: 'COST' | 'SELLING';
        value: Decimal;
        date: Date;
    }>;
}

/**
 * Cost/Expense data with Incoterm applicability
 */
export interface CostWithIncoterm {
    id: string;
    type: 'FIXED' | 'VARIABLE' | 'FREIGHT' | 'INSURANCE';
    description?: string;
    value: Decimal;
    prorate: boolean;
    perUnitOrTotal: 'PER_UNIT' | 'TOTAL';
    incotermToBeIncluded: {
        id: string;
        name: string;
    };
}

/**
 * Pricing configuration
 */
export interface PricingConfig {
    adjustForVAT: boolean;
    vatRate?: Decimal;
    baseCurrency: string;
    roundingMode: 'HALF_UP' | 'DOWN' | 'UP';
    precision: number;
}

/**
 * DEX (Export Duty) calculation result
 */
export interface DEXCalculationResult {
    baseValue: number; // FOB value used for calculation
    adValoremAmount: number; // Percentage-based duty
    fixedAmount: number; // Fixed duty
    totalDEX: number; // Final duty after min/max
    appliedMin: boolean;
    appliedMax: boolean;
}
