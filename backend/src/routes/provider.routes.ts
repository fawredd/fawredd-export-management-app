/**
 * Provider routes
 */

import { Router } from 'express';
import { ProviderController } from '../controllers/provider.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createProviderSchema, updateProviderSchema } from '../utils/validation-schemas';

const router = Router();
const providerController = new ProviderController();

router.use(authenticate);

router.post(
  '/',
  authorize('ADMIN', 'TRADER'),
  validate(createProviderSchema),
  providerController.create.bind(providerController),
);

router.get('/', providerController.getAll.bind(providerController));
router.get('/:id', providerController.getById.bind(providerController));

router.put(
  '/:id',
  authorize('ADMIN', 'TRADER'),
  validate(updateProviderSchema),
  providerController.update.bind(providerController),
);

router.delete('/:id', authorize('ADMIN'), providerController.delete.bind(providerController));

export default router;
