import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { PricingCalculatorService } from '../services/pricing-calculator.service';
import { PricingCalculationRequest } from '../types/pricing.types';
import { z } from 'zod';

const prisma = new PrismaClient();
const pricingService = new PricingCalculatorService(prisma);

/**
 * Validation schemas
 */
const productInputSchema = z.object({
    productId: z.string().cuid(),
    quantity: z.number().int().positive(),
    basePrice: z.number().positive().optional(),
});

const calculatePricingSchema = z.object({
    products: z.array(productInputSchema).min(1),
    expenses: z.array(z.string().cuid()),
    incoterm: z.string().min(2).max(3), // EXW, FCA, FOB, CIF, etc.
    currency: z.string().optional(),
    exchangeRate: z.number().positive().optional(),
});

const pricingConfigSchema = z.object({
    adjustForVAT: z.boolean().optional(),
    vatRate: z.number().min(0).max(100).optional(),
    baseCurrency: z.string().optional(),
    roundingMode: z.enum(['HALF_UP', 'DOWN', 'UP']).optional(),
    precision: z.number().int().min(0).max(10).optional(),
});

/**
 * Calculate export pricing
 * POST /api/pricing/calculate
 */
export const calculatePricing = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate request
    const validatedData = calculatePricingSchema.parse(req.body);

    // Get organization ID from authenticated user
    const organizationId = (req as any).user?.organizationId;
    if (!organizationId) {
      return res.status(401).json({ error: 'Organization ID required' });
    }

    // Calculate pricing
    const result = await pricingService.calculateExportPrice(
      validatedData as PricingCalculationRequest,
      organizationId
    );

    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    next(error);
  }
};

/**
 * Calculate pricing for multiple scenarios (batch)
 * POST /api/pricing/calculate-batch
 */
export const calculatePricingBatch = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const batchSchema = z.object({
            scenarios: z.array(calculatePricingSchema).min(1).max(10),
        });

        const validatedData = batchSchema.parse(req.body);
        const organizationId = (req as any).user?.organizationId;

        if (!organizationId) {
            return res.status(401).json({ error: 'Organization ID required' });
        }

        // Calculate all scenarios
        const results = await Promise.all(
            validatedData.scenarios.map(scenario =>
                pricingService.calculateExportPrice(scenario as PricingCalculationRequest, organizationId)
            )
        );

        res.json({ scenarios: results });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation error', details: error.errors });
        }
        next(error);
    }
};

/**
 * Get pricing configuration for organization
 * GET /api/pricing/config
 */
export const getPricingConfig = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const organizationId = (req as any).user?.organizationId;
        if (!organizationId) {
            return res.status(401).json({ error: 'Organization ID required' });
        }

        const config = await prisma.pricingConfiguration.findUnique({
            where: { organizationId },
        });

        if (!config) {
            // Return default configuration
            return res.json({
                adjustForVAT: false,
                baseCurrency: 'USD',
                roundingMode: 'HALF_UP',
                precision: 2,
            });
        }

        res.json(config);
    } catch (error) {
        next(error);
    }
};

/**
 * Update pricing configuration
 * PUT /api/pricing/config
 */
export const updatePricingConfig = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const validatedData = pricingConfigSchema.parse(req.body);
        const organizationId = (req as any).user?.organizationId;

        if (!organizationId) {
            return res.status(401).json({ error: 'Organization ID required' });
        }

        const config = await prisma.pricingConfiguration.upsert({
            where: { organizationId },
            update: validatedData,
            create: {
                organizationId,
                ...validatedData,
            },
        });

        res.json(config);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation error', details: error.errors });
        }
        next(error);
    }
};

/**
 * Get list of available Incoterms
 * GET /api/pricing/incoterms
 */
export const getIncoterms = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const incoterms = await prisma.incoterm.findMany({
            orderBy: { name: 'asc' },
            include: {
                previousIncoterm: {
                    select: { id: true, name: true },
                },
            },
        });

        res.json(incoterms);
    } catch (error) {
        next(error);
    }
};
