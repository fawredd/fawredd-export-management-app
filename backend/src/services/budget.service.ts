/**
 * Budget service - Business logic for budget operations
 */

import { BudgetRepository } from '../repositories/budget.repository';
import { ProductRepository } from '../repositories/product.repository';
import { calculateBudget, toPrismaDecimal } from '../utils/budget-calculator.util';
import { AppError } from '../middlewares/error.middleware';
import { Incoterm, BudgetStatus, PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const budgetRepository = new BudgetRepository();
const productRepository = new ProductRepository();
const prisma = new PrismaClient();

export class BudgetService {
  async createBudget(data: {
    clientId: string;
    incoterm: Incoterm;
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
    }>;
    costIds?: string[];
  }) {
    // Fetch products to get weight and volume
    const products = await Promise.all(
      data.items.map((item) => productRepository.findById(item.productId)),
    );

    // Validate all products exist
    if (products.some((p) => !p)) {
      throw new AppError(404, 'One or more products not found');
    }

    // Fetch costs if provided
    let costs: any[] = [];
    if (data.costIds && data.costIds.length > 0) {
      costs = await prisma.cost.findMany({
        where: { id: { in: data.costIds } },
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
      type: cost.type,
      value: Number(cost.value),
    }));

    // Calculate budget
    const calculation = calculateBudget(
      itemsWithDetails,
      costsForCalculation,
      data.incoterm,
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

    // Create budget
    const budget = await budgetRepository.create({
      clientId: data.clientId,
      incoterm: data.incoterm,
      totalAmount: toPrismaDecimal(calculation.totalAmount),
      budgetItems,
      costs: data.costIds,
    });

    return budget;
  }

  async getAllBudgets() {
    return budgetRepository.findAll();
  }

  async getBudgetById(id: string) {
    const budget = await budgetRepository.findById(id);
    if (!budget) {
      throw new AppError(404, 'Budget not found');
    }
    return budget;
  }

  async updateBudgetStatus(id: string, status: BudgetStatus) {
    const budget = await budgetRepository.findById(id);
    if (!budget) {
      throw new AppError(404, 'Budget not found');
    }
    return budgetRepository.updateStatus(id, status);
  }

  async deleteBudget(id: string) {
    const budget = await budgetRepository.findById(id);
    if (!budget) {
      throw new AppError(404, 'Budget not found');
    }
    return budgetRepository.delete(id);
  }

  /**
   * Generate a unique share token for budget sharing
   * @param id Budget ID
   * @param expiresInDays Optional expiration in days (default: 30)
   * @returns Updated budget with shareToken
   */
  async generateShareToken(id: string, expiresInDays: number = 30) {
    const budget = await budgetRepository.findById(id); // Changed from this.findById to budgetRepository.findById
    if (!budget) {
      throw new AppError(404, 'Budget not found');
    }

    // Generate unique token
    const shareToken = nanoid(16); // 16 character unique ID

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Update budget with share token and expiration
    // Assuming budgetRepository has an update method that can take partial data
    return budgetRepository.update(id, {
      status: BudgetStatus.SENT,
    });
  }
}
