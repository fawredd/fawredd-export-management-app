/**
 * User routes
 */

import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();
const userController = new UserController();

// All routes require authentication
router.use(authenticate);

// Admin only routes (or restricted logic inside controller)
router.get(
  '/',
  authorize(Role.ADMIN, Role.MANUFACTURER, Role.TRADER),
  userController.getAll.bind(userController),
);
router.get('/:id', userController.getById.bind(userController));
router.post(
  '/',
  authorize(Role.ADMIN, Role.MANUFACTURER, Role.TRADER),
  userController.create.bind(userController),
);
router.put(
  '/:id',
  authorize(Role.ADMIN, Role.MANUFACTURER, Role.TRADER),
  userController.update.bind(userController),
);
router.delete('/:id', authorize(Role.ADMIN), userController.delete.bind(userController));

export default router;
