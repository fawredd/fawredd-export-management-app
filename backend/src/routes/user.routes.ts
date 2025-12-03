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
router.get('/', authorize([Role.ADMIN, Role.MANUFACTURER, Role.TRADER]), userController.getUsers.bind(userController));
router.get('/:id', userController.getUser.bind(userController));
router.post('/', authorize([Role.ADMIN, Role.MANUFACTURER, Role.TRADER]), userController.createUser.bind(userController));
router.put('/:id', authorize([Role.ADMIN, Role.MANUFACTURER, Role.TRADER]), userController.updateUser.bind(userController));
router.delete('/:id', authorize([Role.ADMIN]), userController.deleteUser.bind(userController));

export default router;
