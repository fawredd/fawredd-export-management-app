/**
 * Budget service - Business logic for budget operations
 */

import { BudgetRepository } from '../repositories/budget.repository';
import { ProductRepository } from '../repositories/product.repository';
import { calculateBudget, toPrismaDecimal } from '../utils/budget-calculator.util';
import { AppError } from '../middlewares/error.middleware';
import { BudgetStatus, PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const budgetRepository = new BudgetRepository();
const productRepository = new ProductRepository();
const prisma = new PrismaClient();

export class BudgetService {
  async createBudget(
    data: {
      clientId: string;
      incoterm: string; // Now expects incoterm NAME (e.g., "FOB")
      items: Array<{
        productId: string;
        quantity: number;
        unitPrice: number;
      }>;
      costIds?: string[];
    },
    organizationId?: string | null,
  ) {
    // Find the incoterm by name to get its ID
    const incoterm = await prisma.incoterm.findUnique({
      where: { name: data.incoterm },
    });

    if (!incoterm) {
      throw new AppError(400, `Invalid incoterm: ${data.incoterm}`);
    }

    // Get user's organization
    const finalOrganizationId = organizationId || null;

    // Fetch products to get weight and volume
    const products = await Promise.all(
      data.items.map((item) => productRepository.findById(item.productId, finalOrganizationId)),
    );

    // Validate all products exist
    if (products.some((p) => !p)) {
      throw new AppError(404, 'One or more products not found');
    }

    // Fetch costs if provided
    let costs: any[] = [];
    if (data.costIds && data.costIds.length > 0) {
      costs = await prisma.cost.findMany({
        where: { id: { in: data.costIds }, organizationId: finalOrganizationId },
      });
    }

    // Prepare items with weight and volume
    const itemsWithDetails = data.items.map((item, index) => ({
      ...item,
      weightKg: products[index]?.weightKg || 0,
      volumeM3: products[index]?.volumeM3 || 0,
    }));

    // Prepare costs for calculation
    const costsForCalculation = costs.map((cost) => ({
      id: cost.id,
      name: cost.description || 'Cost',
      type: cost.type,
      value: Number(cost.value),
    }));

    // Calculate budget using incoterm NAME for the calculator
    const calculation = calculateBudget(
      itemsWithDetails,
      costsForCalculation,
      data.incoterm as any, // The calculator expects the string name
      0, // Default duty rate, can be customized per product
    );

    // Create budget items
    const budgetItems = calculation.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: toPrismaDecimal(item.unitPrice),
      proratedCosts: toPrismaDecimal(item.proratedCosts),
      duties: toPrismaDecimal(item.duties),
      freight: toPrismaDecimal(item.freight),
      insurance: toPrismaDecimal(item.insurance),
      totalLine: toPrismaDecimal(item.totalLine),
    }));

    // Create budget with calculation breakdowns
    const budget = await budgetRepository.create({
      clientId: data.clientId,
      incotermId: incoterm.id, // Use incotermId
      organizationId: finalOrganizationId,
      totalAmount: toPrismaDecimal(calculation.totalAmount),
      budgetItems,
      costs: data.costIds,
    });

    return budget;
  }

  async getAllBudgets(organizationId?: string | null) {
    return budgetRepository.findAll(organizationId);
  }

  async getBudgetById(id: string, organizationId?: string | null) {
    const budget = await budgetRepository.findById(id, organizationId);
    if (!budget) {
      throw new AppError(404, 'Budget not found');
    }
    return budget;
  }

  async updateBudgetStatus(id: string, status: BudgetStatus, organizationId?: string | null) {
    const budget = await budgetRepository.findById(id, organizationId);
    if (!budget) {
      throw new AppError(404, 'Budget not found');
    }
    return budgetRepository.updateStatus(id, status, organizationId);
  }

  async deleteBudget(id: string, organizationId?: string | null) {
    const budget = await budgetRepository.findById(id, organizationId);
    if (!budget) {
      throw new AppError(404, 'Budget not found');
    }
    return budgetRepository.delete(id, organizationId);
  }

  async generateShareToken(id: string, expiresInDays: number = 30, organizationId?: string | null) {
    const budget = await budgetRepository.findById(id, organizationId);
    if (!budget) {
      throw new AppError(404, 'Budget not found');
    }

    const shareToken = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    return prisma.budget.update({
      where: { id },
      data: {
        shareToken,
        expiresAt,
      },
    });
  }
}
