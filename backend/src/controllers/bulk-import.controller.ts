/**
 * Bulk Import controller - Handles CSV product imports
 */

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ProductRepository } from '../repositories/product.repository';
import { hashPassword } from '../utils/password.util';
import { AppError } from '../middlewares/error.middleware';
import { Role } from '@prisma/client';
import { parse } from 'csv-parse/sync';

const productRepository = new ProductRepository();

export class BulkImportController {
    async importProducts(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.file) {
                throw new AppError(400, 'No file uploaded');
            }

            const csvContent = req.file.buffer.toString('utf-8');

            // Parse CSV
            const records = parse(csvContent, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
            });

            // Validate row count
            if (records.length > 1000) {
                throw new AppError(400, 'CSV file exceeds maximum of 1000 products');
            }

            if (records.length === 0) {
                throw new AppError(400, 'CSV file is empty');
            }

            const results = {
                success: 0,
                failed: 0,
                errors: [] as any[],
            };

            // Process each record
            for (let i = 0; i < records.length; i++) {
                const record = records[i];

                try {
                    // Validate required fields
                    if (!record.sku || !record.title) {
                        throw new Error('Missing required fields: sku and title are required');
                    }

                    // Check if SKU already exists
                    const existing = await productRepository.findBySku(record.sku);
                    if (existing) {
                        throw new Error(`SKU ${record.sku} already exists`);
                    }

                    // Prepare product data
                    const productData: any = {
                        sku: record.sku,
                        title: record.title,
                        description: record.description || undefined,
                        weightKg: record.weightKg ? parseFloat(record.weightKg) : undefined,
                        volumeM3: record.volumeM3 ? parseFloat(record.volumeM3) : undefined,
                        composition: record.composition || undefined,
                        tariffPositionId: record.tariffPositionId || undefined,
                        unitId: record.unitId || undefined,
                        providerId: record.providerId || undefined,
                        organizationId: req.user?.organizationId || undefined,
                    };

                    // Auto-assign provider for MANUFACTURER
                    if (req.user?.role === Role.MANUFACTURER && !productData.providerId) {
                        // For manufacturers, provider is themselves
                        // This would require a Provider record linked to the user
                        // For now, we'll leave it undefined
                    }

                    await productRepository.create(productData);
                    results.success++;
                } catch (error: any) {
                    results.failed++;
                    results.errors.push({
                        row: i + 2, // +2 because: +1 for 0-index, +1 for header row
                        sku: record.sku,
                        error: error.message,
                    });
                }
            }

            res.json({
                success: true,
                message: `Import completed: ${results.success} succeeded, ${results.failed} failed`,
                results,
            });
        } catch (error) {
            next(error);
        }
    }
}
