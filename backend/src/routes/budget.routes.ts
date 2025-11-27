/**
 * Budget routes
 */

import { Router } from 'express';
import { BudgetController } from '../controllers/budget.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createBudgetSchema, updateBudgetStatusSchema } from '../utils/validation-schemas';

const router = Router();
const budgetController = new BudgetController();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/budgets:
 *   post:
 *     summary: Create a new budget
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientId
 *               - incoterm
 *               - items
 *             properties:
 *               clientId:
 *                 type: string
 *               incoterm:
 *                 type: string
 *                 enum: [FOB, CIF]
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     unitPrice:
 *                       type: number
 *               costIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Budget created successfully
 */
router.post(
  '/',
  authorize('ADMIN', 'TRADER'),
  validate(createBudgetSchema),
  budgetController.create.bind(budgetController),
);

/**
 * @swagger
 * /api/budgets:
 *   get:
 *     summary: Get all budgets
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of budgets
 */
router.get('/', budgetController.getAll.bind(budgetController));

/**
 * @swagger
 * /api/budgets/{id}:
 *   get:
 *     summary: Get budget by ID
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Budget details
 *       404:
 *         description: Budget not found
 */
router.get('/:id', budgetController.getById.bind(budgetController));

/**
 * @swagger
 * /api/budgets/{id}/status:
 *   patch:
 *     summary: Update budget status
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, INVOICED]
 *     responses:
 *       200:
 *         description: Budget status updated
 */
router.patch(
  '/:id/status',
  authorize('ADMIN', 'TRADER'),
  validate(updateBudgetStatusSchema),
  budgetController.updateStatus.bind(budgetController),
);

/**
 * @swagger
 * /api/budgets/{id}/share:
 *   post:
 *     summary: Generate a shareable link for a budget
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expiresInDays:
 *                 type: integer
 *                 default: 30
 *     responses:
 *       200:
 *         description: Share link generated
 */
router.post(
  '/:id/share',
  authorize('ADMIN', 'TRADER', 'MANUFACTURER'),
  budgetController.generateShareLink.bind(budgetController),
);

/**
 * @swagger
 * /api/budgets/{id}:
 *   delete:
 *     summary: Delete budget
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Budget deleted
 */
router.delete('/:id', authorize('ADMIN'), budgetController.delete.bind(budgetController));

export default router;
