import { Router } from 'express';
import { Role } from '@prisma/client';
import packingListController from '../controllers/packing-list.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: PackingLists
 *   description: Packing list management
 */

// All authenticated users can view packing lists
router.get('/', authenticate, packingListController.getAllPackingLists.bind(packingListController));

router.get(
  '/:id',
  authenticate,
  packingListController.getPackingListById.bind(packingListController),
);

// Admin, Trader, and Manufacturer can create/manage packing lists
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.TRADER, Role.MANUFACTURER),
  packingListController.createPackingList.bind(packingListController),
);

router.post(
  '/auto-generate',
  authenticate,
  authorize(Role.ADMIN, Role.TRADER, Role.MANUFACTURER),
  packingListController.autoGenerateFromBudget.bind(packingListController),
);

router.put(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.TRADER, Role.MANUFACTURER),
  packingListController.updatePackingList.bind(packingListController),
);

router.post(
  '/:id/generate-pdf',
  authenticate,
  authorize(Role.ADMIN, Role.TRADER, Role.MANUFACTURER),
  packingListController.generatePdf.bind(packingListController),
);

router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  packingListController.deletePackingList.bind(packingListController),
);

export default router;
