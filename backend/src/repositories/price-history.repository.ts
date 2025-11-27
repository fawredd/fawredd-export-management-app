import { PrismaClient, PriceType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Repository for PriceHistory entity
 */
export class PriceHistoryRepository {
  /**
   * Find price history by product ID
   */
  async findByProductId(productId: string, type?: PriceType) {
    const where: any = { productId };
    if (type) where.type = type;

    return prisma.priceHistory.findMany({
      where,
      orderBy: { date: 'desc' },
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
   * Find price history by ID
   */
  async findById(id: string) {
    return prisma.priceHistory.findUnique({
      where: { id },
      include: {
        product: true,
      },
    });
  }

  /**
   * Create new price history entry
   */
  async create(data: { productId: string; type: PriceType; value: number; date?: Date }) {
    return prisma.priceHistory.create({
      data: {
        ...data,
        date: data.date || new Date(),
      },
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
   * Delete price history entry
   */
  async delete(id: string) {
    return prisma.priceHistory.delete({
      where: { id },
    });
  }

  /**
   * Get latest price for a product
   */
  async getLatestPrice(productId: string, type: PriceType) {
    return prisma.priceHistory.findFirst({
      where: { productId, type },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Get price history within date range
   */
  async findByDateRange(productId: string, startDate: Date, endDate: Date, type?: PriceType) {
    const where: any = {
      productId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    };
    if (type) where.type = type;

    return prisma.priceHistory.findMany({
      where,
      orderBy: { date: 'asc' },
    });
  }
}

export default new PriceHistoryRepository();
