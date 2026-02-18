/**
 * Budget repository - Database access layer for budgets
 */

import { PrismaClient, BudgetStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

export class BudgetRepository {
  async findAll(organizationId?: string | null) {
    return prisma.budget.findMany({
      where: organizationId ? { organizationId } : undefined,
      include: {
        client: true,
        incoterm: true,
        budgetItems: {
          include: {
            product: true,
          },
        },
        costs: true,
      } as any,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, organizationId?: string | null) {
    return prisma.budget.findFirst({
      where: {
        id,
        ...(organizationId ? { organizationId } : {}),
      },
      include: {
        client: true,
        incoterm: true,
        budgetItems: {
          include: {
            product: {
              include: {
                tariffPosition: true,
                unit: true,
                taxes: true,
              },
            },
          },
        },
        costs: true,
        invoices: true,
        packingLists: true,
      } as any,
    });
  }

  async create(data: {
    clientId: string;
    incotermId: string;
    organizationId?: string | null;
    totalAmount?: Decimal;
    budgetItems: any[];
    costs?: string[];
  }) {
    return prisma.budget.create({
      data: {
        client: { connect: { id: data.clientId } },
        incoterm: { connect: { id: data.incotermId } },
        organization: data.organizationId ? { connect: { id: data.organizationId } } : undefined,
        totalAmount: data.totalAmount,
        budgetItems: {
          create: data.budgetItems,
        },
        costs: data.costs?.length
          ? {
              connect: data.costs.map((costId) => ({ id: costId })),
            }
          : undefined,
      },
      include: {
        client: true,
        incoterm: true,
        budgetItems: {
          include: {
            product: true,
          },
        },
        costs: true,
      },
    });
  }

  async updateStatus(id: string, status: BudgetStatus, organizationId?: string | null) {
    // Ensure the budget belongs to the organization if provided
    if (organizationId) {
      const existing = await this.findById(id, organizationId);
      if (!existing) return null;
    }

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

  async delete(id: string, organizationId?: string | null) {
    if (organizationId) {
      const existing = await this.findById(id, organizationId);
      if (!existing) return null;
    }
    return prisma.budget.delete({ where: { id } });
  }
}

export default new BudgetRepository();
