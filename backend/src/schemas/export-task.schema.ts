import { z } from 'zod';

/**
 * Task status enum schema
 */
export const taskStatusSchema = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);

/**
 * Schema for creating a new export task
 */
export const createExportTaskSchema = z.object({
  description: z
    .string()
    .min(5, 'Description must be at least 5 characters')
    .max(1000, 'Description must not exceed 1000 characters'),
  countryId: z.string().cuid('Invalid country ID format'),
  productIds: z
    .array(z.string().cuid('Invalid product ID format'))
    .min(1, 'At least one product must be selected')
    .optional(),
  dueDate: z.string().datetime('Invalid date format').or(z.date()).optional(),
  status: taskStatusSchema.optional().default('PENDING'),
});

/**
 * Schema for updating an export task
 */
export const updateExportTaskSchema = createExportTaskSchema.partial();

/**
 * Schema for updating task status only
 */
export const updateTaskStatusSchema = z.object({
  status: taskStatusSchema,
  completedAt: z.string().datetime('Invalid date format').or(z.date()).optional(),
});

/**
 * Schema for export task ID parameter
 */
export const exportTaskIdSchema = z.object({
  id: z.string().cuid('Invalid export task ID format'),
});

/**
 * Type inference from schemas
 */
export type CreateExportTaskInput = z.infer<typeof createExportTaskSchema>;
export type UpdateExportTaskInput = z.infer<typeof updateExportTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type TaskStatus = z.infer<typeof taskStatusSchema>;
