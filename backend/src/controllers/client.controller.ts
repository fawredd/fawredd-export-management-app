/**
 * Client controller
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middlewares/error.middleware';

const prisma = new PrismaClient();

export class ClientController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const client = await prisma.client.create({
        data: {
          ...req.body,
          organizationId: req.user?.organizationId,
        },
      });
      res.status(201).json(client);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const clients = await prisma.client.findMany({
        where: req.user?.organizationId ? { organizationId: req.user.organizationId } : undefined,
        include: {
          budgets: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      });
      res.json(clients);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const client = await prisma.client.findFirst({
        where: {
          id: req.params.id,
          ...(req.user?.organizationId ? { organizationId: req.user.organizationId } : {}),
        },
        include: {
          budgets: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
      if (!client) {
        throw new AppError(404, 'Client not found');
      }
      res.json(client);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const organizationId = req.user?.organizationId;
      if (organizationId) {
        const existing = await prisma.client.findFirst({
          where: { id: req.params.id, organizationId },
        });
        if (!existing) {
          throw new AppError(404, 'Client not found');
        }
      }

      const client = await prisma.client.update({
        where: { id: req.params.id },
        data: req.body,
      });
      res.json(client);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const organizationId = req.user?.organizationId;
      if (organizationId) {
        const existing = await prisma.client.findFirst({
          where: { id: req.params.id, organizationId },
        });
        if (!existing) {
          throw new AppError(404, 'Client not found');
        }
      }

      await prisma.client.delete({
        where: { id: req.params.id },
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
