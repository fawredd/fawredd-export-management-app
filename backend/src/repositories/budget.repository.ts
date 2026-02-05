/**
 * Budget repository - Database access layer for budgets
 */

import { PrismaClient, BudgetStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

export class BudgetRepository {
  async findAll() {
    return prisma.budget.findMany({
      include: {
        client: true,
        budgetItems: {
          include: {
            product: true,
          },
        },
        costs: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.budget.findUnique({
      where: { id },
      include: {
        client: true,
        budgetItems: {
          include: {
            product: {
              include: {
                tariffPosition: true,
                unit: true,
              },
            },
          },
        },
        costs: true,
        invoices: true,
        packingLists: true,
      },
    });
  }

  async create(data: {
    clientId: string;
    incotermId: string; // CHANGED from Incoterm to string
    organizationId?: string;
    totalAmount?: Decimal;
    budgetItems: any[];
    costs?: any[];
  }) {
    return prisma.budget.create({
      data: {
        clientId: data.clientId,
        incotermId: data.incotermId, // CHANGED
        organizationId: data.organizationId,
        totalAmount: data.totalAmount,
        budgetItems: {
          create: data.budgetItems,
        },
        costs: data.costs
          ? {
              connect: data.costs.map((costId) => ({ id: costId })),
            }
          : undefined,
      },
      include: {
        client: true,
        incoterm: true, // ADD THIS
        budgetItems: {
          include: {
            product: true,
          },
        },
        costs: true,
      },
    });
  }

  async updateStatus(id: string, status: BudgetStatus) {
    return prisma.budget.update({
      where: { id },
      data: { status },
      include: {
        client: true,
        budgetItems: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async update(id: string, data: Partial<{ status: BudgetStatus; totalAmount: Decimal }>) {
    return prisma.budget.update({
      where: { id },
      data,
      include: {
        client: true,
        budgetItems: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.budget.delete({ where: { id } });
  }
}

export default new BudgetRepository();
