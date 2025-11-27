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
  }) {
    const { budgetId, page = 1, limit = 20 } = filters || {};
    const skip = (page - 1) * limit;

    const where: any = {};
    if (budgetId) where.budgetId = budgetId;

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
  async findById(id: string) {
    return prisma.packingList.findUnique({
      where: { id },
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
  ) {
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
  async delete(id: string) {
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
