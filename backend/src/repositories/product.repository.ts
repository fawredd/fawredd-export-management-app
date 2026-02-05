/**
 * Product repository - Database access layer for products
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ProductRepository {
  async findAll() {
    return prisma.product.findMany({
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

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
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

  async findBySku(sku: string) {
    return prisma.product.findUnique({
      where: { sku },
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

  async update(id: string, data: any) {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        tariffPosition: true,
        unit: true,
        provider: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.product.delete({ where: { id } });
  }
}
