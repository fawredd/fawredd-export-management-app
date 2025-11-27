import { Router } from 'express';
import { Role } from '@prisma/client';
import priceHistoryController from '../controllers/price-history.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: PriceHistory
 *   description: Price history management
 */

// All authenticated users can view price history
router.get(
  '/product/:productId',
  authenticate,
  priceHistoryController.getPriceHistoryByProductId.bind(priceHistoryController),
);

// Admin and Manufacturer can manage price history
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.MANUFACTURER),
  priceHistoryController.createPriceHistory.bind(priceHistoryController),
);

router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.MANUFACTURER),
  priceHistoryController.deletePriceHistory.bind(priceHistoryController),
);

export default router;
