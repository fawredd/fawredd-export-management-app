import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Repository for TariffPosition entity
 */
export class TariffPositionRepository {
  /**
   * Find all tariff positions with pagination
   */
  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [tariffPositions, total] = await Promise.all([
      prisma.tariffPosition.findMany({
        skip,
        take: limit,
        orderBy: { code: 'asc' },
        include: {
          _count: {
            select: { products: true },
          },
        },
      }),
      prisma.tariffPosition.count(),
    ]);

    return {
      data: tariffPositions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find tariff position by ID
   */
  async findById(id: string) {
    return prisma.tariffPosition.findUnique({
      where: { id },
      include: {
        products: {
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
   * Find tariff position by code
   */
  async findByCode(code: string) {
    return prisma.tariffPosition.findUnique({
      where: { code },
    });
  }

  /**
   * Create new tariff position
   */
  async create(data: { code: string; description: string; dutyRate?: number }) {
    return prisma.tariffPosition.create({
      data,
    });
  }

  /**
   * Update tariff position
   */
  async update(id: string, data: Partial<{ code: string; description: string; dutyRate: number }>) {
    return prisma.tariffPosition.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete tariff position
   */
  async delete(id: string) {
    return prisma.tariffPosition.delete({
      where: { id },
    });
  }

  /**
   * Search tariff positions by code or description
   */
  async search(query: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [tariffPositions, total] = await Promise.all([
      prisma.tariffPosition.findMany({
        where: {
          OR: [
            { code: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        skip,
        take: limit,
        orderBy: { code: 'asc' },
      }),
      prisma.tariffPosition.count({
        where: {
          OR: [
            { code: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    return {
      data: tariffPositions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export default new TariffPositionRepository();
