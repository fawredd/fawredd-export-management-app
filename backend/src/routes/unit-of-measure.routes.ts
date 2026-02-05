import { Router } from 'express';
import { Role } from '@prisma/client';
import unitOfMeasureController from '../controllers/unit-of-measure.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: UnitsOfMeasure
 *   description: Unit of measure management
 */

// Public routes (authenticated users)
router.get('/', authenticate, unitOfMeasureController.getAllUnits.bind(unitOfMeasureController));

router.get('/:id', authenticate, unitOfMeasureController.getUnitById.bind(unitOfMeasureController));

// Admin only routes
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN),
  unitOfMeasureController.createUnit.bind(unitOfMeasureController),
);

router.put(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  unitOfMeasureController.updateUnit.bind(unitOfMeasureController),
);

router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  unitOfMeasureController.deleteUnit.bind(unitOfMeasureController),
);

export default router;
