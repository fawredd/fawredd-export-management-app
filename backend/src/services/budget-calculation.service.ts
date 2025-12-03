/**
 * Budget Calculation Service
 * Handles FOB/CIF/EXW/FCA/DDP calculations for budgets
 */

import { Prisma } from '@prisma/client';

export interface BudgetItemInput {
    productId: string;
    quantity: number;
    unitPrice: number;
}

export interface CostInput {
    id: string;
    name: string;
    type: 'FIXED' | 'VARIABLE';
    value: number;
}

export interface CalculatedBudgetItem extends BudgetItemInput {
    proratedCosts: number;
    duties: number;
    totalLine: number;
}

export interface BudgetCalculationResult {
    subtotalProducts: number;
    totalExpenses: number;
    totalFOB: number;
    totalCIF: number;
    totalAmount: number;
    items: CalculatedBudgetItem[];
}

export class BudgetCalculationService {
    /**
     * Calculate budget totals based on Incoterm
     * 
     * FOB Calculation:
     * - Subtotal = Sum of (quantity * unitPrice) for all products
     * - Total Expenses = Sum of all costs
     * - Distribute expenses to products by their % of subtotal
     * - FOB Total = Subtotal + Total Expenses
     * 
     * CIF Calculation:
     * - Same as FOB, but freight and insurance shown separately
     * - CIF Total = FOB + Freight + Insurance (shown as separate line items)
     */
    calculateBudget(
        items: BudgetItemInput[],
        costs: CostInput[],
        incoterm: string
    ): BudgetCalculationResult {
        // 1. Calculate subtotal of products
        const subtotalProducts = items.reduce((sum, item) => {
            return sum + (item.quantity * item.unitPrice);
        }, 0);

        // 2. Calculate total expenses
        const totalExpenses = costs.reduce((sum, cost) => sum + cost.value, 0);

        // 3. Calculate FOB (products + distributed expenses)
        const totalFOB = subtotalProducts + totalExpenses;

        // 4. Prorate expenses to each product by price percentage
        const calculatedItems: CalculatedBudgetItem[] = items.map(item => {
            const itemSubtotal = item.quantity * item.unitPrice;
            const percentage = subtotalProducts > 0 ? itemSubtotal / subtotalProducts : 0;

            // Distribute expenses proportionally
            const proratedCosts = totalExpenses * percentage;

            return {
                ...item,
                proratedCosts,
                duties: 0, // TODO: Calculate duties for DDP
                totalLine: itemSubtotal + proratedCosts,
            };
        });

        // 5. For CIF, freight and insurance are shown separately (not distributed)
        // They're already included in totalExpenses, so CIF = FOB
        const totalCIF = totalFOB;

        // 6. Calculate final total based on Incoterm
        let totalAmount: number;
        switch (incoterm) {
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
            case 'DDP':
                totalAmount = totalCIF; // TODO: Add duties calculation
                break;
            default:
                totalAmount = totalFOB;
        }

        return {
            subtotalProducts,
            totalExpenses,
            totalFOB,
            totalCIF,
            totalAmount,
            items: calculatedItems,
        };
    }

    /**
     * Convert calculation result to Prisma Decimal format
     */
    toDecimal(value: number): Prisma.Decimal {
        return new Prisma.Decimal(value);
    }

    /**
     * Convert calculation result to database format
     */
    toDatabase(result: BudgetCalculationResult) {
        return {
            subtotalProducts: this.toDecimal(result.subtotalProducts),
            totalExpenses: this.toDecimal(result.totalExpenses),
            totalFOB: this.toDecimal(result.totalFOB),
            totalCIF: this.toDecimal(result.totalCIF),
            totalAmount: this.toDecimal(result.totalAmount),
        };
    }
}

export const budgetCalculationService = new BudgetCalculationService();
