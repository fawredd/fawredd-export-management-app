import { z } from 'zod';

/**
 * Schema for creating a new tariff position
 */
export const createTariffPositionSchema = z.object({
  code: z.string()
    .min(4, 'Tariff code must be at least 4 characters')
    .max(20, 'Tariff code must not exceed 20 characters')
    .regex(/^[0-9.]+$/, 'Tariff code must contain only numbers and dots'),
  description: z.string()
    .min(3, 'Description must be at least 3 characters')
    .max(500, 'Description must not exceed 500 characters'),
  dutyRate: z.number()
    .min(0, 'Duty rate cannot be negative')
    .max(100, 'Duty rate cannot exceed 100%')
    .optional(),
});

/**
 * Schema for updating a tariff position
 */
export const updateTariffPositionSchema = createTariffPositionSchema.partial();

/**
 * Schema for tariff position ID parameter
 */
export const tariffPositionIdSchema = z.object({
  id: z.string().cuid('Invalid tariff position ID format'),
});

/**
 * Type inference from schemas
 */
export type CreateTariffPositionInput = z.infer<typeof createTariffPositionSchema>;
export type UpdateTariffPositionInput = z.infer<typeof updateTariffPositionSchema>;
