import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createProductSchema, updateProductSchema } from '../utils/validation-schemas';
import { upload } from '../middlewares/upload.middleware';

const router = Router();
const productController = new ProductController();

router.use(authenticate);

router.post(
  '/',
  authorize('ADMIN', 'TRADER', 'MANUFACTURER'),
  validate(createProductSchema),
  productController.create.bind(productController),
);

router.get('/', productController.getAll.bind(productController));
router.get('/:id', productController.getById.bind(productController));

router.put(
  '/:id',
  authorize('ADMIN', 'TRADER', 'MANUFACTURER'),
  validate(updateProductSchema),
  productController.update.bind(productController),
);

// Image upload routes
router.post(
  '/:id/images',
  authorize('ADMIN', 'TRADER', 'MANUFACTURER'),
  upload.array('images', 5), // Max 5 images at once
  productController.uploadImages.bind(productController),
);

router.delete(
  '/:id/images/:imageUrl',
  authorize('ADMIN', 'TRADER', 'MANUFACTURER'),
  productController.deleteImage.bind(productController),
);

router.delete('/:id', authorize('ADMIN'), productController.delete.bind(productController));

export default router;
