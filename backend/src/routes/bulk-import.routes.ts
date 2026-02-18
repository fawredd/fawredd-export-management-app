/**
 * Bulk Import routes
 */

import { Router } from 'express';
import { BulkImportController } from '../controllers/bulk-import.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';
import multer from 'multer';

const router = Router();
const bulkImportController = new BulkImportController();

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

// Only ADMIN, MANUFACTURER, and TRADER can import
router.post(
  '/products',
  authenticate,
  authorize(Role.ADMIN, Role.MANUFACTURER, Role.TRADER),
  upload.single('file'),
  bulkImportController.importProducts.bind(bulkImportController),
);

export default router;
