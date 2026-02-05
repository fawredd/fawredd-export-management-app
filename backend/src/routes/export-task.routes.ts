import { Router } from 'express';
import { Role } from '@prisma/client';
import exportTaskController from '../controllers/export-task.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: ExportTasks
 *   description: Export task management
 */

// All authenticated users can view export tasks
router.get('/', authenticate, exportTaskController.getAll.bind(exportTaskController));

router.get('/:id', authenticate, exportTaskController.getById.bind(exportTaskController));

// Admin, Trader, and Manufacturer can create/update tasks
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.TRADER, Role.MANUFACTURER),
  exportTaskController.create.bind(exportTaskController),
);

router.put(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.TRADER, Role.MANUFACTURER),
  exportTaskController.update.bind(exportTaskController),
);

router.patch(
  '/:id/status',
  authenticate,
  authorize(Role.ADMIN, Role.TRADER, Role.MANUFACTURER),
  exportTaskController.updateStatus.bind(exportTaskController),
);

// Admin only delete
router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  exportTaskController.delete.bind(exportTaskController),
);

export default router;
