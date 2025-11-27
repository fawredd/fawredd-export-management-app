/**
 * Budget calculation utilities
 * Handles FOB and CIF incoterm calculations with cost proration
 */

import { Decimal } from '@prisma/client/runtime/library';
import { Incoterm } from '@prisma/client';

export interface BudgetItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
  weightKg?: number;
  volumeM3?: number;
}

export interface CostInput {
  type: 'FIXED' | 'VARIABLE' | 'FREIGHT' | 'INSURANCE';
  value: number;
}

export interface BudgetCalculationResult {
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    proratedCosts: number;
    duties: number;
    freight: number;
    insurance: number;
    totalLine: number;
  }>;
  totalAmount: number;
}

/**
 * Calculate budget totals based on incoterm (FOB or CIF)
 *
 * FOB (Free On Board): Seller pays costs until goods are on board the vessel
 * - Includes: product cost + fixed costs (prorated) + variable costs
 * - Excludes: freight and insurance (buyer's responsibility)
 *
 * CIF (Cost, Insurance, Freight): Seller pays costs, insurance, and freight
 * - Includes: product cost + fixed costs (prorated) + variable costs + freight + insurance
 */
export const calculateBudget = (
  items: BudgetItemInput[],
  costs: CostInput[],
  incoterm: Incoterm,
  dutyRate: number = 0,
): BudgetCalculationResult => {
  // Calculate total weight and volume for proration
  const totalWeight = items.reduce((sum, item) => sum + (item.weightKg || 0) * item.quantity, 0);
  const totalVolume = items.reduce((sum, item) => sum + (item.volumeM3 || 0) * item.quantity, 0);

  // Separate costs by type
  const fixedCosts = costs.filter((c) => c.type === 'FIXED').reduce((sum, c) => sum + c.value, 0);
  const variableCosts = costs
    .filter((c) => c.type === 'VARIABLE')
    .reduce((sum, c) => sum + c.value, 0);
  const freightCosts = costs
    .filter((c) => c.type === 'FREIGHT')
    .reduce((sum, c) => sum + c.value, 0);
  const insuranceCosts = costs
    .filter((c) => c.type === 'INSURANCE')
    .reduce((sum, c) => sum + c.value, 0);

  const calculatedItems = items.map((item) => {
    const itemWeight = (item.weightKg || 0) * item.quantity;
    const itemVolume = (item.volumeM3 || 0) * item.quantity;

    // Prorate fixed costs based on weight (or volume if no weight)
    const weightRatio = totalWeight > 0 ? itemWeight / totalWeight : 0;
    const volumeRatio = totalVolume > 0 ? itemVolume / totalVolume : 0;
    const prorationRatio = totalWeight > 0 ? weightRatio : volumeRatio;

    const proratedFixedCosts = fixedCosts * prorationRatio;
    const proratedVariableCosts = variableCosts * prorationRatio;
    const proratedCosts = proratedFixedCosts + proratedVariableCosts;

    // Calculate duties (applied to product cost + prorated costs)
    const subtotal = item.unitPrice * item.quantity + proratedCosts;
    const duties = subtotal * (dutyRate / 100);

    // Prorate freight and insurance for CIF
    let freight = 0;
    let insurance = 0;

    if (incoterm === 'CIF') {
      freight = freightCosts * prorationRatio;
      insurance = insuranceCosts * prorationRatio;
    }

    // Calculate total line
    const totalLine = subtotal + duties + freight + insurance;

    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      proratedCosts: Number(proratedCosts.toFixed(6)),
      duties: Number(duties.toFixed(6)),
      freight: Number(freight.toFixed(6)),
      insurance: Number(insurance.toFixed(6)),
      totalLine: Number(totalLine.toFixed(6)),
    };
  });

  const totalAmount = calculatedItems.reduce((sum, item) => sum + item.totalLine, 0);

  return {
    items: calculatedItems,
    totalAmount: Number(totalAmount.toFixed(6)),
  };
};

/**
 * Convert a budget calculation result to Prisma Decimal format
 */
export const toPrismaDecimal = (value: number): Decimal => {
  return new Decimal(value);
};
