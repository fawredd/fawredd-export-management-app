/**
 * Cost routes
 */

import { Router } from 'express';
import { CostController } from '../controllers/cost.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createCostSchema } from '../utils/validation-schemas';

const router = Router();
const costController = new CostController();

router.use(authenticate);

router.post(
  '/',
  authorize('ADMIN', 'TRADER'),
  validate(createCostSchema),
  costController.create.bind(costController),
);

router.get('/', costController.getAll.bind(costController));
router.get('/:id', costController.getById.bind(costController));

router.put('/:id', authorize('ADMIN', 'TRADER'), costController.update.bind(costController));

router.delete('/:id', authorize('ADMIN'), costController.delete.bind(costController));

export default router;
