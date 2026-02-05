import { z } from 'zod';

/**
 * Schema for creating a new product
 */
export const createProductSchema = z.object({
  sku: z
    .string()
    .min(3, 'SKU must be at least 3 characters')
    .max(50, 'SKU must not exceed 50 characters')
    .regex(/^[A-Z0-9-]+$/, 'SKU must contain only uppercase letters, numbers, and hyphens'),
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters'),
  description: z.string().max(2000, 'Description must not exceed 2000 characters').optional(),
  weightKg: z
    .number()
    .positive('Weight must be positive')
    .max(100000, 'Weight is too large')
    .optional(),
  volumeM3: z
    .number()
    .positive('Volume must be positive')
    .max(10000, 'Volume is too large')
    .optional(),
  composition: z.string().max(500, 'Composition must not exceed 500 characters').optional(),
  tariffPositionId: z.string().cuid('Invalid tariff position ID format').optional(),
  unitId: z.string().cuid('Invalid unit ID format').optional(),
  providerId: z.string().cuid('Invalid provider ID format').optional(),
  costPrice: z
    .number()
    .positive('Cost price must be positive')
    .max(999999999.99, 'Cost price is too large')
    .optional(),
  sellingPrice: z
    .number()
    .positive('Selling price must be positive')
    .max(999999999.99, 'Selling price is too large')
    .optional(),
});

/**
 * Schema for updating a product
 */
export const updateProductSchema = createProductSchema.partial();

/**
 * Schema for product ID parameter
 */
export const productIdSchema = z.object({
  id: z.string().cuid('Invalid product ID format'),
});

/**
 * Schema for product query parameters
 */
export const productQuerySchema = z.object({
  search: z.string().optional(),
  providerId: z.string().cuid('Invalid provider ID format').optional(),
  tariffPositionId: z.string().cuid('Invalid tariff position ID format').optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

/**
 * Type inference from schemas
 */
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
