import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Repository for Tax entity
 */
export class TaxRepository {
  /**
   * Find all taxes
   */
  async findAll(organizationId?: string | null) {
    return prisma.tax.findMany({
      where: organizationId ? { organizationId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            title: true,
          },
        },
      },
    });
  }

  /**
   * Find tax by ID
   */
  async findById(id: string, organizationId?: string | null) {
    return prisma.tax.findFirst({
      where: {
        id,
        ...(organizationId ? { organizationId } : {}),
      },
      include: {
        product: true,
      },
    });
  }

  /**
   * Find taxes by product ID
   */
  async findByProductId(productId: string, organizationId?: string | null) {
    return prisma.tax.findMany({
      where: {
        productId,
        ...(organizationId ? { organizationId } : {}),
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Create new tax
   */
  async create(data: {
    productId: string;
    name: string;
    percentage: number;
    organizationId?: string | null;
  }) {
    return prisma.tax.create({
      data,
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            title: true,
          },
        },
      },
    });
  }

  /**
   * Update tax
   */
  async update(
    id: string,
    data: Partial<{ name: string; percentage: number }>,
    organizationId?: string | null,
  ) {
    if (organizationId) {
      const existing = await this.findById(id, organizationId);
      if (!existing) return null;
    }
    return prisma.tax.update({
      where: { id },
      data,
      include: {
        product: true,
      },
    });
  }

  /**
   * Delete tax
   */
  async delete(id: string, organizationId?: string | null) {
    if (organizationId) {
      const existing = await this.findById(id, organizationId);
      if (!existing) return null;
    }
    return prisma.tax.delete({
      where: { id },
    });
  }

  /**
   * Calculate total tax percentage for a product
   */
  async getTotalTaxPercentage(productId: string): Promise<number> {
    const taxes = await this.findByProductId(productId);
    return taxes.reduce((sum, tax) => sum + Number(tax.percentage), 0);
  }
}

export default new TaxRepository();
