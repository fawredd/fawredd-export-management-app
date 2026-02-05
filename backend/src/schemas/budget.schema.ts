import { z } from 'zod';

/**
 * Incoterm enum schema
 */
export const incotermSchema = z.enum(['FOB', 'CIF']);

/**
 * Budget status enum schema
 */
export const budgetStatusSchema = z.enum([
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'REJECTED',
  'INVOICED',
]);

/**
 * Schema for budget item
 */
export const budgetItemSchema = z.object({
  productId: z.string().cuid('Invalid product ID format'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  unitPrice: z.number().positive('Unit price must be positive'),
  proratedCosts: z.number().min(0, 'Prorated costs cannot be negative').optional().default(0),
  duties: z.number().min(0, 'Duties cannot be negative').optional().default(0),
  freight: z.number().min(0, 'Freight cannot be negative').optional().default(0),
  insurance: z.number().min(0, 'Insurance cannot be negative').optional().default(0),
  totalLine: z.number().positive('Total line must be positive'),
});

/**
 * Schema for creating a new budget
 */
export const createBudgetSchema = z.object({
  clientId: z.string().cuid('Invalid client ID format'),
  incoterm: incotermSchema,
  status: budgetStatusSchema.optional().default('DRAFT'),
  budgetItems: z.array(budgetItemSchema).min(1, 'At least one budget item is required'),
  costIds: z.array(z.string().cuid('Invalid cost ID format')).optional(),
  totalAmount: z.number().positive('Total amount must be positive').optional(),
});

/**
 * Schema for updating a budget
 */
export const updateBudgetSchema = z.object({
  clientId: z.string().cuid('Invalid client ID format').optional(),
  incoterm: incotermSchema.optional(),
  status: budgetStatusSchema.optional(),
  budgetItems: z.array(budgetItemSchema).optional(),
  costIds: z.array(z.string().cuid('Invalid cost ID format')).optional(),
  totalAmount: z.number().positive('Total amount must be positive').optional(),
});

/**
 * Schema for budget ID parameter
 */
export const budgetIdSchema = z.object({
  id: z.string().cuid('Invalid budget ID format'),
});

/**
 * Schema for budget query parameters
 */
export const budgetQuerySchema = z.object({
  clientId: z.string().cuid('Invalid client ID format').optional(),
  status: budgetStatusSchema.optional(),
  incoterm: incotermSchema.optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

/**
 * Type inference from schemas
 */
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type BudgetItemInput = z.infer<typeof budgetItemSchema>;
export type BudgetQuery = z.infer<typeof budgetQuerySchema>;
export type Incoterm = z.infer<typeof incotermSchema>;
export type BudgetStatus = z.infer<typeof budgetStatusSchema>;
