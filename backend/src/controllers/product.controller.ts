/**
 * Product controller
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ProductRepository } from '../repositories/product.repository';
import { AppError } from '../middlewares/error.middleware';
import priceHistoryRepository from '../repositories/price-history.repository';
import { PriceType } from '@prisma/client';
import { getStorageProvider, isRunningOnVercel } from '../services/storage.service';

const productRepository = new ProductRepository();

export class ProductController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { costPrice, sellingPrice, ...productData } = req.body;
      const organizationId = req.user?.organizationId || null;

      // Create the product first
      const product = await productRepository.create({ ...productData, organizationId });

      // Create price history entries if prices are provided
      const priceHistoryPromises = [];
      if (costPrice !== undefined && costPrice !== null) {
        priceHistoryPromises.push(
          priceHistoryRepository.create({
            productId: product.id,
            type: PriceType.COST,
            value: costPrice,
          }),
        );
      }
      if (sellingPrice !== undefined && sellingPrice !== null) {
        priceHistoryPromises.push(
          priceHistoryRepository.create({
            productId: product.id,
            type: PriceType.SELLING,
            value: sellingPrice,
          }),
        );
      }

      // Wait for all price history entries to be created
      await Promise.all(priceHistoryPromises);

      // Fetch the product again with price history included
      const productWithPrices = await productRepository.findById(product.id, organizationId);

      res.status(201).json(productWithPrices);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const products = await productRepository.findAll(req.user?.organizationId);
      res.json(products);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const product = await productRepository.findById(req.params.id, req.user?.organizationId);
      if (!product) {
        throw new AppError(404, 'Product not found');
      }
      res.json(product);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { costPrice, sellingPrice, ...productData } = req.body;
      const organizationId = req.user?.organizationId || null;

      // Update the product first
      const product = await productRepository.update(req.params.id, productData, organizationId);

      // Create price history entries if prices are provided
      const priceHistoryPromises = [];

      if (costPrice !== undefined && costPrice !== null) {
        // Get the latest cost price to check if it changed
        const latestCost = await priceHistoryRepository.getLatestPrice(product.id, PriceType.COST);

        // Only create a new entry if the price changed
        if (!latestCost || Number(latestCost.value) !== costPrice) {
          priceHistoryPromises.push(
            priceHistoryRepository.create({
              productId: product.id,
              type: PriceType.COST,
              value: costPrice,
            }),
          );
        }
      }

      if (sellingPrice !== undefined && sellingPrice !== null) {
        // Get the latest selling price to check if it changed
        const latestSelling = await priceHistoryRepository.getLatestPrice(
          product.id,
          PriceType.SELLING,
        );

        // Only create a new entry if the price changed
        if (!latestSelling || Number(latestSelling.value) !== sellingPrice) {
          priceHistoryPromises.push(
            priceHistoryRepository.create({
              productId: product.id,
              type: PriceType.SELLING,
              value: sellingPrice,
            }),
          );
        }
      }

      // Wait for all price history entries to be created
      await Promise.all(priceHistoryPromises);

      // Fetch the product again with price history included
      const productWithPrices = await productRepository.findById(product.id, organizationId);

      res.json(productWithPrices);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await productRepository.delete(req.params.id, req.user?.organizationId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async uploadImages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const productId = req.params.id;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        throw new AppError(400, 'No files uploaded');
      }

      // Get existing product
      const product = await productRepository.findById(productId, req.user?.organizationId);
      if (!product) {
        throw new AppError(404, 'Product not found');
      }

      const storage = getStorageProvider('products');
      const newImageUrls: string[] = [];

      for (const file of files) {
        if (isRunningOnVercel()) {
          // Vercel: file is in memory (buffer)
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const key = `products/${uniqueSuffix}-${file.originalname}`;
          const url = await storage.upload(key, file.buffer, file.mimetype);
          newImageUrls.push(url);
        } else {
          // Local: file already written to disk by multer
          const protocol = req.protocol;
          const host = req.get('host');
          newImageUrls.push(`${protocol}://${host}/uploads/products/${file.filename}`);
        }
      }

      // Update product with new image URLs
      const updatedProduct = await productRepository.update(
        productId,
        {
          imageUrls: [...(product.imageUrls || []), ...newImageUrls],
        },
        req.user?.organizationId,
      );

      res.json({
        message: 'Images uploaded successfully',
        imageUrls: newImageUrls,
        product: updatedProduct,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteImage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id: productId, imageUrl } = req.params;

      const product = await productRepository.findById(productId, req.user?.organizationId);
      if (!product) {
        throw new AppError(404, 'Product not found');
      }

      // Remove image URL from array
      const decodedUrl = decodeURIComponent(imageUrl);
      const updatedImageUrls = (product.imageUrls || []).filter((url) => url !== decodedUrl);

      // Delete file via storage provider
      const storage = getStorageProvider('products');
      await storage.delete(decodedUrl);

      // Update product
      const updatedProduct = await productRepository.update(
        productId,
        {
          imageUrls: updatedImageUrls,
        },
        req.user?.organizationId,
      );

      res.json({
        message: 'Image deleted successfully',
        product: updatedProduct,
      });
    } catch (error) {
      next(error);
    }
  }
}
