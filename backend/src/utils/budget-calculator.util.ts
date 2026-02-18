/**
 * Budget calculation utilities
 * Handles FOB/CIF/EXW/FCA/DDP incoterm calculations with cost proration
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
  id?: string;
  name?: string;
  type: 'FIXED' | 'VARIABLE';
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
  subtotalProducts: number;
  totalExpenses: number;
  totalFOB: number;
  totalCIF: number;
  totalAmount: number;
}

/**
 * Calculate budget totals based on incoterm
 *
 * FOB Calculation:
 * - Subtotal = Sum of (quantity * unitPrice) for all products
 * - Total Expenses = Sum of all costs (FIXED + VARIABLE)
 * - Distribute expenses to products by their % of subtotal (by price, not weight)
 * - FOB Total = Subtotal + Total Expenses
 *
 * CIF Calculation:
 * - Same as FOB
 * - Freight and Insurance are shown separately (NOT distributed to items)
 * - CIF Total = FOB + Freight + Insurance
 *
 * Note: User can categorize costs by name (e.g., "Freight", "Insurance", "Customs")
 * but type (FIXED/VARIABLE) only indicates if cost scales with quantity
 */
export const calculateBudget = (
  items: BudgetItemInput[],
  costs: CostInput[],
  incoterm: Incoterm,
  dutyRate: number = 0,
): BudgetCalculationResult => {
  // 1. Calculate subtotal of products
  const subtotalProducts = items.reduce((sum, item) => {
    return sum + item.quantity * item.unitPrice;
  }, 0);

  // 2. Calculate total expenses (all costs)
  const totalExpenses = costs.reduce((sum, cost) => sum + cost.value, 0);

  // 3. Calculate FOB (products + distributed expenses)
  const totalFOB = subtotalProducts + totalExpenses;

  // 4. Prorate expenses to each product by price percentage
  const calculatedItems = items.map((item) => {
    const itemSubtotal = item.quantity * item.unitPrice;
    const percentage = subtotalProducts > 0 ? itemSubtotal / subtotalProducts : 0;

    // Distribute expenses proportionally by price
    const proratedCosts = totalExpenses * percentage;

    // Calculate duties (for DDP)
    const subtotalWithCosts = itemSubtotal + proratedCosts;
    const duties = subtotalWithCosts * (dutyRate / 100);

    // For CIF, freight and insurance are NOT prorated to items
    // They are shown as separate line items in the budget
    const freight = 0;
    const insurance = 0;

    // Calculate total line (product + prorated costs + duties)
    const totalLine = itemSubtotal + proratedCosts + duties;

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

  // 5. For CIF, freight and insurance are shown separately
  // User will identify them by name in the Cost model
  // CIF = FOB (already includes all expenses)
  const totalCIF = totalFOB;

  // 6. Calculate final total based on Incoterm
  let totalAmount: number;
  switch (incoterm.name) {
    case 'EXW':
      totalAmount = subtotalProducts; // Just products, no expenses
      break;
    case 'FCA':
      totalAmount = subtotalProducts; // Simplified - just products
      break;
    case 'FOB':
      totalAmount = totalFOB;
      break;
    case 'CIF':
      totalAmount = totalCIF;
      break;
    case 'DDP': {
      // DDP includes duties
      const totalDuties = calculatedItems.reduce((sum, item) => sum + item.duties, 0);
      totalAmount = totalCIF + totalDuties;
      break;
    }
    default:
      totalAmount = totalFOB;
  }

  return {
    items: calculatedItems,
    subtotalProducts: Number(subtotalProducts.toFixed(6)),
    totalExpenses: Number(totalExpenses.toFixed(6)),
    totalFOB: Number(totalFOB.toFixed(6)),
    totalCIF: Number(totalCIF.toFixed(6)),
    totalAmount: Number(totalAmount.toFixed(6)),
  };
};

/**
 * Convert a number to Prisma Decimal format
 */
export const toPrismaDecimal = (value: number): Decimal => {
  return new Decimal(value);
};
