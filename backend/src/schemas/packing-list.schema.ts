import { z } from 'zod';

/**
 * Schema for packing list details (flexible JSON structure)
 */
export const packingListDetailsSchema = z.object({
  items: z.array(z.object({
    productId: z.string().cuid('Invalid product ID'),
    productName: z.string(),
    quantity: z.number().int().positive(),
    weight: z.number().positive().optional(),
    volume: z.number().positive().optional(),
    packageType: z.string().optional(),
    packageCount: z.number().int().positive().optional(),
  })).min(1, 'At least one item is required'),
  totalWeight: z.number().positive().optional(),
  totalVolume: z.number().positive().optional(),
  totalPackages: z.number().int().positive().optional(),
  notes: z.string().max(1000).optional(),
});

/**
 * Schema for creating a new packing list
 */
export const createPackingListSchema = z.object({
  budgetId: z.string().cuid('Invalid budget ID format'),
  details: packingListDetailsSchema,
  pdfUrl: z.string().url('Invalid PDF URL').optional(),
});

/**
 * Schema for updating a packing list
 */
export const updatePackingListSchema = createPackingListSchema.partial().omit({ budgetId: true });

/**
 * Schema for packing list ID parameter
 */
export const packingListIdSchema = z.object({
  id: z.string().cuid('Invalid packing list ID format'),
});

/**
 * Schema for generating PDF
 */
export const generatePdfSchema = z.object({
  id: z.string().cuid('Invalid packing list ID format'),
});

/**
 * Type inference from schemas
 */
export type CreatePackingListInput = z.infer<typeof createPackingListSchema>;
export type UpdatePackingListInput = z.infer<typeof updatePackingListSchema>;
export type PackingListDetails = z.infer<typeof packingListDetailsSchema>;
