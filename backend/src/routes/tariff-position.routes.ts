import { Router } from 'express';
import { Role } from '@prisma/client';
import tariffPositionController from '../controllers/tariff-position.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: TariffPositions
 *   description: Tariff position management
 */

// Public routes (authenticated users)
router.get(
  '/',
  authenticate,
  tariffPositionController.getAllTariffPositions.bind(tariffPositionController),
);

router.get(
  '/:id',
  authenticate,
  tariffPositionController.getTariffPositionById.bind(tariffPositionController),
);

// Admin and Manufacturer routes
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.MANUFACTURER),
  tariffPositionController.createTariffPosition.bind(tariffPositionController),
);

router.put(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.MANUFACTURER),
  tariffPositionController.updateTariffPosition.bind(tariffPositionController),
);

// Admin only routes
router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  tariffPositionController.deleteTariffPosition.bind(tariffPositionController),
);

export default router;
