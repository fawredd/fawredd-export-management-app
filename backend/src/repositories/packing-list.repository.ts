import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Repository for PackingList entity
 */
export class PackingListRepository {
  /**
   * Find all packing lists with pagination and filters
   */
  async findAll(filters?: {
    budgetId?: string;
    page?: number;
    limit?: number;
    organizationId?: string | null;
  }) {
    const { budgetId, page = 1, limit = 20, organizationId } = filters || {};
    const skip = (page - 1) * limit;

    const where: any = {};
    if (budgetId) where.budgetId = budgetId;
    if (organizationId) where.organizationId = organizationId;

    const [packingLists, total] = await Promise.all([
      prisma.packingList.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          budget: {
            include: {
              client: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      prisma.packingList.count({ where }),
    ]);

    return {
      data: packingLists,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find packing list by ID
   */
  async findById(id: string, organizationId?: string | null) {
    return prisma.packingList.findFirst({
      where: {
        id,
        ...(organizationId ? { organizationId } : {}),
      },
      include: {
        budget: {
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
          },
        },
      },
    });
  }

  /**
   * Create new packing list
   */
  async create(data: {
    budgetId: string;
    details: any;
    organizationId?: string | null;
    pdfUrl?: string;
  }) {
    return prisma.packingList.create({
      data,
      include: {
        budget: {
          include: {
            client: true,
          },
        },
      },
    });
  }

  /**
   * Update packing list
   */
  async update(
    id: string,
    data: Partial<{
      details: any;
      pdfUrl: string | null;
    }>,
    organizationId?: string | null,
  ) {
    if (organizationId) {
      const existing = await this.findById(id, organizationId);
      if (!existing) return null;
    }
    return prisma.packingList.update({
      where: { id },
      data,
      include: {
        budget: {
          include: {
            client: true,
          },
        },
      },
    });
  }

  /**
   * Update PDF URL
   */
  async updatePdfUrl(id: string, pdfUrl: string) {
    return prisma.packingList.update({
      where: { id },
      data: { pdfUrl },
    });
  }

  /**
   * Delete packing list
   */
  async delete(id: string, organizationId?: string | null) {
    if (organizationId) {
      const existing = await this.findById(id, organizationId);
      if (!existing) return null;
    }
    return prisma.packingList.delete({
      where: { id },
    });
  }

  /**
   * Find packing lists by budget ID
   */
  async findByBudgetId(budgetId: string) {
    return prisma.packingList.findMany({
      where: { budgetId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export default new PackingListRepository();
