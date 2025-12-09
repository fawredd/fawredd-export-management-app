import { Router } from 'express';
import {
    calculatePricing,
    calculatePricingBatch,
    getPricingConfig,
    updatePricingConfig,
    getIncoterms,
} from '../controllers/pricing-calculator.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/pricing/calculate:
 *   post:
 *     summary: Calculate export pricing for products
 *     tags: [Pricing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - products
 *               - expenses
 *               - incoterm
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     basePrice:
 *                       type: number
 *               expenses:
 *                 type: array
 *                 items:
 *                   type: string
 *               incoterm:
 *                 type: string
 *                 example: FOB
 *     responses:
 *       200:
 *         description: Pricing calculation result
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/calculate', authenticate, calculatePricing);

/**
 * @swagger
 * /api/pricing/calculate-batch:
 *   post:
 *     summary: Calculate pricing for multiple scenarios
 *     tags: [Pricing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scenarios:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Batch calculation results
 */
router.post('/calculate-batch', authenticate, calculatePricingBatch);

/**
 * @swagger
 * /api/pricing/config:
 *   get:
 *     summary: Get pricing configuration
 *     tags: [Pricing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pricing configuration
 */
router.get('/config', authenticate, getPricingConfig);

/**
 * @swagger
 * /api/pricing/config:
 *   put:
 *     summary: Update pricing configuration
 *     tags: [Pricing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adjustForVAT:
 *                 type: boolean
 *               vatRate:
 *                 type: number
 *               baseCurrency:
 *                 type: string
 *               roundingMode:
 *                 type: string
 *                 enum: [HALF_UP, DOWN, UP]
 *               precision:
 *                 type: number
 *     responses:
 *       200:
 *         description: Updated configuration
 */
router.put('/config', authenticate, updatePricingConfig);

/**
 * @swagger
 * /api/pricing/incoterms:
 *   get:
 *     summary: Get list of available Incoterms
 *     tags: [Pricing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of Incoterms
 */
router.get('/incoterms', authenticate, getIncoterms);

export default router;
