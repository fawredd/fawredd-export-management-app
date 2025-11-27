import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Repository for UnitOfMeasure entity
 */
export class UnitOfMeasureRepository {
  /**
   * Find all units of measure
   */
  async findAll() {
    return prisma.unitOfMeasure.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  /**
   * Find unit by ID
   */
  async findById(id: string) {
    return prisma.unitOfMeasure.findUnique({
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
   * Find unit by abbreviation
   */
  async findByAbbreviation(abbreviation: string) {
    return prisma.unitOfMeasure.findUnique({
      where: { abbreviation },
    });
  }

  /**
   * Create new unit of measure
   */
  async create(data: { name: string; abbreviation: string }) {
    return prisma.unitOfMeasure.create({
      data,
    });
  }

  /**
   * Update unit of measure
   */
  async update(id: string, data: Partial<{ name: string; abbreviation: string }>) {
    return prisma.unitOfMeasure.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete unit of measure
   */
  async delete(id: string) {
    return prisma.unitOfMeasure.delete({
      where: { id },
    });
  }
}

export default new UnitOfMeasureRepository();
