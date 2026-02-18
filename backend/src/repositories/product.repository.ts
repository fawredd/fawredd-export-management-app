/**
 * Product repository - Database access layer for products
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ProductRepository {
  async findAll(organizationId?: string | null) {
    return prisma.product.findMany({
      where: organizationId ? { organizationId } : undefined,
      include: {
        tariffPosition: true,
        unit: true,
        provider: true,
        priceHistory: {
          orderBy: { date: 'desc' },
        },
      },
    });
  }

  async findById(id: string, organizationId?: string | null) {
    return prisma.product.findFirst({
      where: {
        id,
        ...(organizationId ? { organizationId } : {}),
      },
      include: {
        tariffPosition: true,
        unit: true,
        provider: true,
        priceHistory: {
          orderBy: { date: 'desc' },
        },
        taxes: true,
      },
    });
  }

  async findBySku(sku: string, organizationId?: string | null) {
    return prisma.product.findFirst({
      where: {
        sku,
        ...(organizationId ? { organizationId } : {}),
      },
      include: {
        tariffPosition: true,
        unit: true,
        provider: true,
      },
    });
  }

  async create(data: any) {
    return prisma.product.create({
      data,
      include: {
        tariffPosition: true,
        unit: true,
        provider: true,
      },
    });
  }

  async update(id: string, data: any, organizationId?: string | null) {
    return prisma.product.update({
      where: { 
        id,
        ...(organizationId ? { organizationId } : {}),
      },
      data,
      include: {
        tariffPosition: true,
        unit: true,
        provider: true,
      },
    });
  }

  async delete(id: string, organizationId?: string | null) {
    if (organizationId) {
      const existing = await this.findById(id, organizationId);
      if (!existing) return null;
    }
    return prisma.product.delete({ where: { id } });
  }
}
