import { Router } from 'express';
import { Role } from '@prisma/client';
import countryController from '../controllers/country.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Countries
 *   description: Country management
 */

// Public routes (authenticated users)
router.get('/', authenticate, countryController.getAllCountries.bind(countryController));

router.get('/:id', authenticate, countryController.getCountryById.bind(countryController));

// Admin only routes
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN),
  countryController.createCountry.bind(countryController),
);

router.put(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  countryController.updateCountry.bind(countryController),
);

router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  countryController.deleteCountry.bind(countryController),
);

export default router;
