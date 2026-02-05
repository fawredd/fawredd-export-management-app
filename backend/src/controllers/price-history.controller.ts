import { Request, Response, NextFunction } from 'express';
import priceHistoryService from '../services/price-history.service';
import {
  createPriceHistorySchema,
  priceHistoryIdSchema,
  productIdParamSchema,
  priceTypeSchema,
} from '../schemas/price-history.schema';

/**
 * Controller for PriceHistory endpoints
 */
export class PriceHistoryController {
  /**
   * @route GET /api/price-history/product/:productId
   * @summary Get price history for a product
   * @returns {PriceHistory[]} 200 - List of price history entries
   */
  async getPriceHistoryByProductId(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = productIdParamSchema.parse(req.params);
      const type = req.query.type ? priceTypeSchema.parse(req.query.type) : undefined;

      const priceHistory = await priceHistoryService.getPriceHistoryByProductId(productId, type);

      res.json({
        success: true,
        data: priceHistory,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route POST /api/price-history
   * @summary Create new price history entry
   * @returns {PriceHistory} 201 - Created price history entry
   */
  async createPriceHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createPriceHistorySchema.parse(req.body);
      const priceHistory = await priceHistoryService.createPriceHistory(data);

      res.status(201).json({
        success: true,
        data: priceHistory,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route DELETE /api/price-history/:id
   * @summary Delete price history entry
   * @returns {Object} 200 - Success message
   */
  async deletePriceHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = priceHistoryIdSchema.parse(req.params);
      await priceHistoryService.deletePriceHistory(id);

      res.json({
        success: true,
        message: 'Price history entry deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PriceHistoryController();
