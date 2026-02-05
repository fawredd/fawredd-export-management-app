import { Router } from 'express';
import { Role } from '@prisma/client';
import taxController from '../controllers/tax.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Taxes
 *   description: Tax management
 */

// All authenticated users can view taxes
router.get('/', authenticate, taxController.getAllTaxes.bind(taxController));

router.get(
  '/product/:productId',
  authenticate,
  taxController.getTaxesByProductId.bind(taxController),
);

router.get('/:id', authenticate, taxController.getTaxById.bind(taxController));

// Admin and Manufacturer can manage taxes
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.MANUFACTURER),
  taxController.createTax.bind(taxController),
);

router.put(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.MANUFACTURER),
  taxController.updateTax.bind(taxController),
);

router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.MANUFACTURER),
  taxController.deleteTax.bind(taxController),
);

export default router;
