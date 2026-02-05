import { z } from 'zod';

/**
 * Schema for creating a new unit of measure
 */
export const createUnitSchema = z.object({
  name: z
    .string()
    .min(2, 'Unit name must be at least 2 characters')
    .max(50, 'Unit name must not exceed 50 characters'),
  abbreviation: z
    .string()
    .min(1, 'Abbreviation must be at least 1 character')
    .max(10, 'Abbreviation must not exceed 10 characters')
    .regex(/^[a-zA-Z0-9³²]+$/, 'Abbreviation must contain only letters, numbers, and superscripts'),
});

/**
 * Schema for updating a unit of measure
 */
export const updateUnitSchema = createUnitSchema.partial();

/**
 * Schema for unit ID parameter
 */
export const unitIdSchema = z.object({
  id: z.string().cuid('Invalid unit ID format'),
});

/**
 * Type inference from schemas
 */
export type CreateUnitInput = z.infer<typeof createUnitSchema>;
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;
