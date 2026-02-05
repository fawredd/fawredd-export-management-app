/**
 * Provider controller
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middlewares/error.middleware';

const prisma = new PrismaClient();

export class ProviderController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const provider = await prisma.provider.create({
        data: {
          ...req.body,
          organizationId: (req as any).user?.organizationId,
        },
      });
      res.status(201).json(provider);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const providers = await prisma.provider.findMany({
        where: {
          organizationId: (req as any).user?.organizationId,
        },
        include: {
          products: true,
        },
      });
      res.json(providers);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const provider = await prisma.provider.findFirst({
        where: {
          id: req.params.id,
          organizationId: (req as any).user?.organizationId,
        },
        include: {
          products: true,
        },
      });
      if (!provider) {
        throw new AppError(404, 'Provider not found');
      }
      res.json(provider);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const organizationId = (req as any).user?.organizationId;
      const provider = await prisma.provider.update({
        where: {
          id: req.params.id,
          organizationId: organizationId,
        },
        data: req.body,
      });
      res.json(provider);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const organizationId = (req as any).user?.organizationId;
      await prisma.provider.delete({
        where: {
          id: req.params.id,
          organizationId: organizationId,
        },
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
