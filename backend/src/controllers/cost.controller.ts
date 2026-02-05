/**
 * Cost controller
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middlewares/error.middleware';
import { toPrismaDecimal } from '../utils/budget-calculator.util';

const prisma = new PrismaClient();

export class CostController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cost = await prisma.cost.create({
        data: {
          ...req.body,
          value: toPrismaDecimal(req.body.value),
          organizationId: req.user?.organizationId,
        },
      });
      res.status(201).json(cost);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const costs = await prisma.cost.findMany({
        where: req.user?.organizationId ? { organizationId: req.user.organizationId } : undefined,
        orderBy: { createdAt: 'desc' },
      });
      res.json(costs);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cost = await prisma.cost.findFirst({
        where: {
          id: req.params.id,
          ...(req.user?.organizationId ? { organizationId: req.user.organizationId } : {}),
        },
      });
      if (!cost) {
        throw new AppError(404, 'Cost not found');
      }
      res.json(cost);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const organizationId = req.user?.organizationId;
      if (organizationId) {
        const existing = await prisma.cost.findFirst({
          where: { id: req.params.id, organizationId },
        });
        if (!existing) {
          throw new AppError(404, 'Cost not found');
        }
      }

      const cost = await prisma.cost.update({
        where: { id: req.params.id },
        data: {
          ...req.body,
          value: req.body.value ? toPrismaDecimal(req.body.value) : undefined,
        },
      });
      res.json(cost);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const organizationId = req.user?.organizationId;
      if (organizationId) {
        const existing = await prisma.cost.findFirst({
          where: { id: req.params.id, organizationId },
        });
        if (!existing) {
          throw new AppError(404, 'Cost not found');
        }
      }

      await prisma.cost.delete({
        where: { id: req.params.id },
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
