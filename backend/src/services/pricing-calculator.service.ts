import { PrismaClient, Decimal } from '@prisma/client';
import {
    PricingCalculationRequest,
    PricingCalculationResponse,
    ProductPricingResult,
    CostBreakdownItem,
    ProductWithTariff,
    CostWithIncoterm,
    PricingConfig,
    DEXCalculationResult,
} from '../types/pricing.types';

/**
 * Pricing Calculator Service
 * Implements export pricing calculations according to Incoterms
 */
export class PricingCalculatorService {
    constructor(private prisma: PrismaClient) { }

    /**
     * Calculate export price for products according to selected Incoterm
     */
    async calculateExportPrice(
        request: PricingCalculationRequest,
        organizationId: string
    ): Promise<PricingCalculationResponse> {
        // 1. Fetch pricing configuration
        const config = await this.getPricingConfig(organizationId);

        // 2. Fetch products with tariff positions and price history
        const products = await this.fetchProducts(request.products.map(p => p.productId));

        // 3. Fetch expenses/costs
        const expenses = await this.fetchExpenses(request.expenses);

        // 4. Get Incoterm hierarchy
        const incoterm = await this.getIncotermWithHierarchy(request.incoterm);
        if (!incoterm) {
            throw new Error(`Incoterm ${request.incoterm} not found`);
        }

        // 5. Filter expenses applicable to this Incoterm
        const applicableExpenses = this.filterExpensesByIncoterm(expenses, incoterm);

        // 6. Calculate pricing for each product
        const productResults: ProductPricingResult[] = [];

        for (const productInput of request.products) {
            const product = products.find(p => p.id === productInput.productId);
            if (!product) continue;

            const result = await this.calculateProductPrice(
                product,
                productInput.quantity,
                productInput.basePrice,
                applicableExpenses,
                incoterm.name,
                config,
                request.products,
                products
            );

            productResults.push(result);
        }

        // 7. Calculate metadata totals
        const metadata = this.calculateMetadata(productResults, config);

        return {
            incoterm: request.incoterm,
            products: productResults,
            metadata,
        };
    }

    /**
     * Calculate pricing for a single product
     */
    private async calculateProductPrice(
        product: ProductWithTariff,
        quantity: number,
        basePriceOverride: number | undefined,
        expenses: CostWithIncoterm[],
        incotermName: string,
        config: PricingConfig,
        allProductInputs: any[],
        allProducts: ProductWithTariff[]
    ): Promise<ProductPricingResult> {
        const breakdown: CostBreakdownItem[] = [];

        // 1. Get base export price (BEP)
        const latestSellingPrice = product.priceHistory
            .filter(ph => ph.type === 'SELLING')
            .sort((a, b) => b.date.getTime() - a.date.getTime())[0];

        let basePrice = basePriceOverride ?? (latestSellingPrice ? Number(latestSellingPrice.value) : 0);

        // Apply VAT adjustment if configured
        if (config.adjustForVAT && config.vatRate) {
            basePrice = basePrice / (1 + Number(config.vatRate) / 100);
        }

        // Add base price to breakdown
        breakdown.push({
            label: 'Base Export Price (BEP)',
            type: 'product',
            amountPerUnit: basePrice,
            amountTotal: basePrice * quantity,
            includedInIncoterm: true,
        });

        let currentUnitPrice = basePrice;

        // 2. Calculate prorated expenses
        const proratedExpenses = expenses.filter(e => e.prorate);
        const nonProratedExpenses = expenses.filter(e => !e.prorate);

        // Calculate total value of all products for proration
        const totalProductsValue = allProductInputs.reduce((sum, input) => {
            const prod = allProducts.find(p => p.id === input.productId);
            if (!prod) return sum;

            const prodPrice = input.basePrice ?? Number(
                prod.priceHistory
                    .filter(ph => ph.type === 'SELLING')
                    .sort((a, b) => b.date.getTime() - a.date.getTime())[0]?.value ?? 0
            );

            return sum + (prodPrice * input.quantity);
        }, 0);

        // Prorate expenses
        for (const expense of proratedExpenses) {
            const expenseShare = this.prorateExpense(
                expense,
                basePrice * quantity,
                totalProductsValue,
                quantity
            );

            breakdown.push({
                label: `${expense.description || expense.type} (prorated)`,
                type: 'prorated',
                amountPerUnit: expenseShare.perUnit,
                amountTotal: expenseShare.total,
                includedInIncoterm: this.isExpenseIncludedInIncoterm(expense, incotermName),
            });

            if (this.isExpenseIncludedInIncoterm(expense, incotermName)) {
                currentUnitPrice += expenseShare.perUnit;
            }
        }

        // Non-prorated expenses (distributed equally or per unit)
        for (const expense of nonProratedExpenses) {
            let amountPerUnit = 0;
            let amountTotal = Number(expense.value);

            if (expense.perUnitOrTotal === 'PER_UNIT') {
                amountPerUnit = Number(expense.value);
                amountTotal = amountPerUnit * quantity;
            } else {
                // TOTAL - distribute equally across all products
                const totalQuantity = allProductInputs.reduce((sum, p) => sum + p.quantity, 0);
                amountPerUnit = amountTotal / totalQuantity;
                amountTotal = amountPerUnit * quantity;
            }

            const included = this.isExpenseIncludedInIncoterm(expense, incotermName);

            breakdown.push({
                label: expense.description || expense.type,
                type: expense.type.toLowerCase() as any,
                amountPerUnit,
                amountTotal,
                includedInIncoterm: included,
            });

            if (included) {
                currentUnitPrice += amountPerUnit;
            }
        }

        // 3. Calculate DEX (Export Duties) if applicable and tariff position exists
        if (product.tariffPosition && ['FCA', 'FOB', 'CIF', 'CFR', 'CPT', 'CIP', 'DAP', 'DDP'].includes(incotermName)) {
            const fobValue = currentUnitPrice * quantity;
            const dexResult = this.calculateDEX(fobValue, product.tariffPosition);

            if (dexResult.totalDEX > 0) {
                breakdown.push({
                    label: 'Export Duty (DEX)',
                    type: 'duty',
                    amountPerUnit: dexResult.totalDEX / quantity,
                    amountTotal: dexResult.totalDEX,
                    includedInIncoterm: true,
                    description: `Ad valorem: ${dexResult.adValoremAmount.toFixed(2)}, Fixed: ${dexResult.fixedAmount.toFixed(2)}`,
                });

                currentUnitPrice += dexResult.totalDEX / quantity;
            }
        }

        // 4. Apply rounding
        currentUnitPrice = this.applyRounding(currentUnitPrice, config);

        return {
            productId: product.id,
            productName: product.title,
            quantity,
            unitPrice: currentUnitPrice,
            totalPrice: currentUnitPrice * quantity,
            breakdown,
        };
    }

    /**
     * Calculate Export Duty (DEX)
     */
    private calculateDEX(
        fobValue: number,
        tariffPosition: ProductWithTariff['tariffPosition']
    ): DEXCalculationResult {
        if (!tariffPosition) {
            return {
                baseValue: fobValue,
                adValoremAmount: 0,
                fixedAmount: 0,
                totalDEX: 0,
                appliedMin: false,
                appliedMax: false,
            };
        }

        let dex = 0;
        let adValoremAmount = 0;
        let fixedAmount = 0;

        // Calculate ad valorem (percentage-based)
        if (tariffPosition.adValoremRate) {
            adValoremAmount = fobValue * (Number(tariffPosition.adValoremRate) / 100);
            dex += adValoremAmount;
        }

        // Add fixed duty
        if (tariffPosition.fixedExportDuty) {
            fixedAmount = Number(tariffPosition.fixedExportDuty);
            dex += fixedAmount;
        }

        // Apply minimum
        let appliedMin = false;
        if (tariffPosition.exportDutyMinAmount && dex < Number(tariffPosition.exportDutyMinAmount)) {
            dex = Number(tariffPosition.exportDutyMinAmount);
            appliedMin = true;
        }

        // Apply maximum
        let appliedMax = false;
        if (tariffPosition.exportDutyMaxAmount && dex > Number(tariffPosition.exportDutyMaxAmount)) {
            dex = Number(tariffPosition.exportDutyMaxAmount);
            appliedMax = true;
        }

        return {
            baseValue: fobValue,
            adValoremAmount,
            fixedAmount,
            totalDEX: dex,
            appliedMin,
            appliedMax,
        };
    }

    /**
     * Prorate expense across products
     */
    private prorateExpense(
        expense: CostWithIncoterm,
        productTotalValue: number,
        sumAllProductsValue: number,
        quantity: number
    ): { perUnit: number; total: number } {
        if (sumAllProductsValue === 0) {
            return { perUnit: 0, total: 0 };
        }

        const percentage = productTotalValue / sumAllProductsValue;
        const total = Number(expense.value) * percentage;
        const perUnit = total / quantity;

        return { perUnit, total };
    }

    /**
     * Filter expenses by Incoterm applicability
     * An expense applies if the selected Incoterm is at or after the expense's incotermToBeIncluded
     */
    private filterExpensesByIncoterm(
        expenses: CostWithIncoterm[],
        incoterm: any
    ): CostWithIncoterm[] {
        // For now, return all expenses - the inclusion logic is handled in isExpenseIncludedInIncoterm
        return expenses;
    }

    /**
     * Check if expense should be included in the given Incoterm
     */
    private isExpenseIncludedInIncoterm(expense: CostWithIncoterm, incotermName: string): boolean {
        // Incoterm hierarchy (simplified - in production, query the actual hierarchy)
        const hierarchy = ['EXW', 'FCA', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DDP'];

        const expenseIncotermIndex = hierarchy.indexOf(expense.incotermToBeIncluded.name);
        const selectedIncotermIndex = hierarchy.indexOf(incotermName);

        // Include if selected Incoterm is at or after the expense's Incoterm
        return selectedIncotermIndex >= expenseIncotermIndex;
    }

    /**
     * Apply rounding based on configuration
     */
    private applyRounding(value: number, config: PricingConfig): number {
        const multiplier = Math.pow(10, config.precision);

        switch (config.roundingMode) {
            case 'HALF_UP':
                return Math.round(value * multiplier) / multiplier;
            case 'DOWN':
                return Math.floor(value * multiplier) / multiplier;
            case 'UP':
                return Math.ceil(value * multiplier) / multiplier;
            default:
                return Math.round(value * multiplier) / multiplier;
        }
    }

    /**
     * Calculate metadata totals
     */
    private calculateMetadata(products: ProductPricingResult[], config: PricingConfig): any {
        const totalFOB = products.reduce((sum, p) => sum + p.totalPrice, 0);

        return {
            currency: config.baseCurrency,
            precision: config.precision,
            roundingMode: config.roundingMode,
            calculatedAt: new Date(),
            totalFOB,
            totalCIF: totalFOB, // Will be enhanced later
        };
    }

    /**
     * Fetch products with tariff and price history
     */
    private async fetchProducts(productIds: string[]): Promise<ProductWithTariff[]> {
        return this.prisma.product.findMany({
            where: { id: { in: productIds } },
            include: {
                tariffPosition: true,
                priceHistory: {
                    orderBy: { date: 'desc' },
                },
            },
        }) as any;
    }

    /**
     * Fetch expenses/costs
     */
    private async fetchExpenses(expenseIds: string[]): Promise<CostWithIncoterm[]> {
        return this.prisma.cost.findMany({
            where: { id: { in: expenseIds } },
            include: {
                incotermToBeIncluded: true,
            },
        }) as any;
    }

    /**
     * Get Incoterm with hierarchy
     */
    private async getIncotermWithHierarchy(name: string) {
        return this.prisma.incoterm.findUnique({
            where: { name },
            include: {
                previousIncoterm: true,
                nextIncoterms: true,
            },
        });
    }

    /**
     * Get pricing configuration for organization
     */
    private async getPricingConfig(organizationId: string): Promise<PricingConfig> {
        const config = await this.prisma.pricingConfiguration.findUnique({
            where: { organizationId },
        });

        if (!config) {
            // Return default configuration
            return {
                adjustForVAT: false,
                baseCurrency: 'USD',
                roundingMode: 'HALF_UP',
                precision: 2,
            };
        }

        return {
            adjustForVAT: config.adjustForVAT,
            vatRate: config.vatRate ?? undefined,
            baseCurrency: config.baseCurrency,
            roundingMode: config.roundingMode as any,
            precision: config.precision,
        };
    }
}
