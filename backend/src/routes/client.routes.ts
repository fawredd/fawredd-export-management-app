/**
 * Client routes
 */

import { Router } from 'express';
import { ClientController } from '../controllers/client.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createClientSchema, updateClientSchema } from '../utils/validation-schemas';

const router = Router();
const clientController = new ClientController();

router.use(authenticate);

router.post(
  '/',
  authorize('ADMIN', 'TRADER'),
  validate(createClientSchema),
  clientController.create.bind(clientController),
);

router.get('/', clientController.getAll.bind(clientController));
router.get('/:id', clientController.getById.bind(clientController));

router.put(
  '/:id',
  authorize('ADMIN', 'TRADER'),
  validate(updateClientSchema),
  clientController.update.bind(clientController),
);

router.delete('/:id', authorize('ADMIN'), clientController.delete.bind(clientController));

export default router;
