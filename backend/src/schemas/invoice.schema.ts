import { z } from 'zod';

/**
 * Schema for creating a new invoice
 */
export const createInvoiceSchema = z.object({
  budgetId: z.string().cuid('Invalid budget ID format'),
  invoiceNumber: z
    .string()
    .min(3, 'Invoice number must be at least 3 characters')
    .max(50, 'Invoice number must not exceed 50 characters')
    .regex(
      /^[A-Z0-9-]+$/,
      'Invoice number must contain only uppercase letters, numbers, and hyphens',
    ),
  totalAmount: z
    .number()
    .positive('Total amount must be positive')
    .max(999999999.99, 'Total amount is too large'),
  issueDate: z.string().datetime('Invalid issue date format').or(z.date()).optional(),
  dueDate: z.string().datetime('Invalid due date format').or(z.date()).optional(),
  pdfUrl: z.string().url('Invalid PDF URL').optional(),
});

/**
 * Schema for updating an invoice
 */
export const updateInvoiceSchema = createInvoiceSchema.partial().omit({ budgetId: true });

/**
 * Schema for invoice ID parameter
 */
export const invoiceIdSchema = z.object({
  id: z.string().cuid('Invalid invoice ID format'),
});

/**
 * Schema for generating PDF
 */
export const generatePdfSchema = z.object({
  id: z.string().cuid('Invalid invoice ID format'),
});

/**
 * Type inference from schemas
 */
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
