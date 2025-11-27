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
        data: req.body,
      });
      res.status(201).json(provider);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const providers = await prisma.provider.findMany({
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
      const provider = await prisma.provider.findUnique({
        where: { id: req.params.id },
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
      const provider = await prisma.provider.update({
        where: { id: req.params.id },
        data: req.body,
      });
      res.json(provider);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await prisma.provider.delete({
        where: { id: req.params.id },
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
