/**
 * Budget controller
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { BudgetService } from '../services/budget.service';

const budgetService = new BudgetService();

export class BudgetController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const budget = await budgetService.createBudget(req.body);
      res.status(201).json(budget);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const budgets = await budgetService.getAllBudgets();
      res.json(budgets);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const budget = await budgetService.getBudgetById(req.params.id);
      res.json(budget);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const budget = await budgetService.updateBudgetStatus(req.params.id, req.body.status);
      res.json(budget);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await budgetService.deleteBudget(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async generateShareLink(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { expiresInDays } = req.body;
      
      const budget = await budgetService.generateShareToken(id, expiresInDays || 30);
      
      // Generate full share URL
      const protocol = req.protocol;
      const host = req.get('host');
      const shareUrl = `${protocol}://${host}/public/budget/${budget.shareToken}`;
      
      res.json({
        message: 'Share link generated successfully',
        budget,
        shareUrl,
        expiresAt: budget.expiresAt,
      });
    } catch (error) {
      next(error);
    }
  }
}
