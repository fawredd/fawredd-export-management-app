import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Repository for Country entity
 */
export class CountryRepository {
  /**
   * Find all countries
   */
  async findAll() {
    return prisma.country.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { exportTasks: true },
        },
      },
    });
  }

  /**
   * Find country by ID
   */
  async findById(id: string) {
    return prisma.country.findUnique({
      where: { id },
      include: {
        exportTasks: {
          select: {
            id: true,
            description: true,
            status: true,
            dueDate: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * Find country by code
   */
  async findByCode(code: string) {
    return prisma.country.findUnique({
      where: { code },
    });
  }

  /**
   * Create new country
   */
  async create(data: { name: string; code: string }) {
    return prisma.country.create({
      data,
    });
  }

  /**
   * Update country
   */
  async update(id: string, data: Partial<{ name: string; code: string }>) {
    return prisma.country.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete country
   */
  async delete(id: string) {
    return prisma.country.delete({
      where: { id },
    });
  }
}

export default new CountryRepository();
