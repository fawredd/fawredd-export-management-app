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
router.get(
  '/',
  authenticate,
  exportTaskController.getAllExportTasks.bind(exportTaskController),
);

router.get(
  '/:id',
  authenticate,
  exportTaskController.getExportTaskById.bind(exportTaskController),
);

// Admin, Trader, and Manufacturer can create/update tasks
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.TRADER, Role.MANUFACTURER),
  exportTaskController.createExportTask.bind(exportTaskController),
);

router.put(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.TRADER, Role.MANUFACTURER),
  exportTaskController.updateExportTask.bind(exportTaskController),
);

router.patch(
  '/:id/status',
  authenticate,
  authorize(Role.ADMIN, Role.TRADER, Role.MANUFACTURER),
  exportTaskController.updateTaskStatus.bind(exportTaskController),
);

// Admin only delete
router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  exportTaskController.deleteExportTask.bind(exportTaskController),
);

export default router;
