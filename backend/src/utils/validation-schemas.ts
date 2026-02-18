/**
 * Zod validation schemas for API requests
 */

import { z } from 'zod';
import { Role, TaskStatus, CostType, BudgetStatus } from '@prisma/client';

// Auth schemas
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
    name: z.string().optional(),
    role: z.nativeEnum(Role).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

// Product schemas
export const createProductSchema = z.object({
  body: z.object({
    sku: z.string().min(1, 'SKU is required'),
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    weightKg: z.number().positive().optional(),
    volumeM3: z.number().positive().optional(),
    composition: z.string().optional(),
    tariffPositionId: z.string().optional(),
    unitId: z.string().optional(),
    providerId: z.string().optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    sku: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    weightKg: z.number().positive().optional(),
    volumeM3: z.number().positive().optional(),
    composition: z.string().optional(),
    tariffPositionId: z.string().optional(),
    unitId: z.string().optional(),
    providerId: z.string().optional(),
  }),
});

// Provider schemas
export const createProviderSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    taxId: z.string().optional(),
  }),
});

export const updateProviderSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    taxId: z.string().optional(),
  }),
});

// Client schemas
export const createClientSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    taxId: z.string().optional(),
  }),
});

export const updateClientSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    taxId: z.string().optional(),
  }),
});

// Budget schemas
const VALID_INCOTERMS = ['EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP'] as const;

export const createBudgetSchema = z.object({
  body: z.object({
    clientId: z.string().min(1, 'Client ID is required'),
    incoterm: z.enum(VALID_INCOTERMS, {
      errorMap: () => ({ message: `Invalid incoterm. Must be one of: ${VALID_INCOTERMS.join(', ')}` }),
    }),
    items: z
      .array(
        z.object({
          productId: z.string(),
          quantity: z.number().positive(),
          unitPrice: z.number().positive(),
        }),
      )
      .min(1, 'At least one item is required'),
    costIds: z.array(z.string()).optional(),
    expenses: z
      .array(
        z.object({
          id: z.string().optional(),
          description: z.string(),
          value: z.number(),
          type: z.string().optional(),
        }),
      )
      .optional(),
  }),
});

export const updateBudgetStatusSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    status: z.nativeEnum(BudgetStatus),
  }),
});

// Cost schemas
export const createCostSchema = z.object({
  body: z.object({
    type: z.nativeEnum(CostType),
    description: z.string().optional(),
    value: z.number().positive('Value must be positive'),
  }),
});

// Export Task schemas
export const createExportTaskSchema = z.object({
  body: z.object({
    description: z.string().min(1, 'Description is required'),
    countryId: z.string().min(1, 'Country ID is required'),
    productIds: z.array(z.string()).optional(),
    dueDate: z.string().datetime().optional(),
  }),
});

export const updateExportTaskSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    description: z.string().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    countryId: z.string().optional(),
    productIds: z.array(z.string()).optional(),
    dueDate: z.string().datetime().optional(),
  }),
});
