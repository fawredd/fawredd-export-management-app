import { PrismaClient, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Repository for ExportTask entity
 */
export class ExportTaskRepository {
  /**
   * Find all export tasks with optional filters
   */
  async findAll(filters?: {
    status?: TaskStatus;
    countryId?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, countryId, page = 1, limit = 20 } = filters || {};
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (countryId) where.countryId = countryId;

    const [exportTasks, total] = await Promise.all([
      prisma.exportTask.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          products: {
            select: {
              id: true,
              sku: true,
              title: true,
            },
          },
        },
      }),
      prisma.exportTask.count({ where }),
    ]);

    return {
      data: exportTasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find export task by ID
   */
  async findById(id: string) {
    return prisma.exportTask.findUnique({
      where: { id },
      include: {
        country: true,
        products: {
          include: {
            tariffPosition: true,
            unit: true,
          },
        },
      },
    });
  }

  /**
   * Create new export task
   */
  async create(data: {
    description: string;
    countryId: string;
    status?: TaskStatus;
    dueDate?: Date;
    productIds?: string[];
  }) {
    const { productIds, ...taskData } = data;

    return prisma.exportTask.create({
      data: {
        ...taskData,
        products: productIds
          ? {
            connect: productIds.map((id) => ({ id })),
          }
          : undefined,
      },
      include: {
        country: true,
        products: true,
      },
    });
  }

  /**
   * Update export task
   */
  async update(
    id: string,
    data: Partial<{
      description: string;
      countryId: string;
      status: TaskStatus;
      dueDate: Date | null;
      completedAt: Date | null;
      productIds: string[];
    }>
  ) {
    const { productIds, ...updateData } = data;

    return prisma.exportTask.update({
      where: { id },
      data: {
        ...updateData,
        products: productIds
          ? {
            set: productIds.map((id) => ({ id })),
          }
          : undefined,
      },
      include: {
        country: true,
        products: true,
      },
    });
  }

  /**
   * Update task status
   */
  async updateStatus(id: string, status: TaskStatus, completedAt?: Date) {
    return prisma.exportTask.update({
      where: { id },
      data: {
        status,
        completedAt: status === 'COMPLETED' ? completedAt || new Date() : null,
      },
    });
  }

  /**
   * Delete export task
   */
  async delete(id: string) {
    return prisma.exportTask.delete({
      where: { id },
    });
  }

  /**
   * Find tasks by country
   */
  async findByCountry(countryId: string) {
    return prisma.exportTask.findMany({
      where: { countryId },
      orderBy: { createdAt: 'desc' },
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
   * Find tasks by status
   */
  async findByStatus(status: TaskStatus) {
    return prisma.exportTask.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
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
}

export default new ExportTaskRepository();
