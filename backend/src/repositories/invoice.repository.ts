import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Repository for Invoice entity
 */
export class InvoiceRepository {
  /**
   * Find all invoices with pagination and filters
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

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
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
      prisma.invoice.count({ where }),
    ]);

    return {
      data: invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find invoice by ID
   */
  async findById(id: string) {
    return prisma.invoice.findUnique({
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
            costs: true,
          },
        },
      },
    });
  }

  /**
   * Find invoice by invoice number
   */
  async findByInvoiceNumber(invoiceNumber: string) {
    return prisma.invoice.findUnique({
      where: { invoiceNumber },
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
   * Create new invoice
   */
  async create(data: {
    budgetId: string;
    invoiceNumber: string;
    totalAmount: number;
    issueDate?: Date;
    dueDate?: Date;
    pdfUrl?: string;
  }) {
    return prisma.invoice.create({
      data: {
        ...data,
        issueDate: data.issueDate || new Date(),
      },
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
   * Update invoice
   */
  async update(
    id: string,
    data: Partial<{
      invoiceNumber: string;
      totalAmount: number;
      issueDate: Date;
      dueDate: Date | null;
      pdfUrl: string | null;
    }>,
  ) {
    return prisma.invoice.update({
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
    return prisma.invoice.update({
      where: { id },
      data: { pdfUrl },
    });
  }

  /**
   * Delete invoice
   */
  async delete(id: string) {
    return prisma.invoice.delete({
      where: { id },
    });
  }

  /**
   * Find invoices by budget ID
   */
  async findByBudgetId(budgetId: string) {
    return prisma.invoice.findMany({
      where: { budgetId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export default new InvoiceRepository();
