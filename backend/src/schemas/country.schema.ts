import { z } from 'zod';

/**
 * Schema for creating a new country
 */
export const createCountrySchema = z.object({
  name: z.string()
    .min(2, 'Country name must be at least 2 characters')
    .max(100, 'Country name must not exceed 100 characters'),
  code: z.string()
    .length(2, 'Country code must be exactly 2 characters (ISO 3166-1 alpha-2)')
    .regex(/^[A-Z]{2}$/, 'Country code must be uppercase letters (e.g., AR, US, BR)')
    .or(z.string()
      .length(3, 'Country code must be 2 or 3 characters (ISO 3166-1)')
      .regex(/^[A-Z]{3}$/, 'Country code must be uppercase letters')),
});

/**
 * Schema for updating a country
 */
export const updateCountrySchema = createCountrySchema.partial();

/**
 * Schema for country ID parameter
 */
export const countryIdSchema = z.object({
  id: z.string().cuid('Invalid country ID format'),
});

/**
 * Type inference from schemas
 */
export type CreateCountryInput = z.infer<typeof createCountrySchema>;
export type UpdateCountryInput = z.infer<typeof updateCountrySchema>;
