import { Router } from 'express';
import { Role } from '@prisma/client';
import invoiceController from '../controllers/invoice.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: Invoice management
 */

// All authenticated users can view invoices (filtered by role in service layer)
router.get('/', authenticate, invoiceController.getAllInvoices.bind(invoiceController));

router.get('/:id', authenticate, invoiceController.getInvoiceById.bind(invoiceController));

// Admin, Trader, and Manufacturer can create/manage invoices
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.TRADER, Role.MANUFACTURER),
  invoiceController.createInvoice.bind(invoiceController),
);

router.put(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.TRADER, Role.MANUFACTURER),
  invoiceController.updateInvoice.bind(invoiceController),
);

router.post(
  '/:id/generate-pdf',
  authenticate,
  authorize(Role.ADMIN, Role.TRADER, Role.MANUFACTURER),
  invoiceController.generatePdf.bind(invoiceController),
);

router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  invoiceController.deleteInvoice.bind(invoiceController),
);

export default router;
