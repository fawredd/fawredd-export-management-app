import { Request, Response, NextFunction } from 'express';
import taxService from '../services/tax.service';
import {
  createTaxSchema,
  updateTaxSchema,
  taxIdSchema,
  productIdParamSchema,
} from '../schemas/tax.schema';

/**
 * Controller for Tax endpoints
 */
export class TaxController {
  /**
   * @route GET /api/taxes
   * @summary Get all taxes
   * @returns {Tax[]} 200 - List of taxes
   */
  async getAllTaxes(req: Request, res: Response, next: NextFunction) {
    try {
      const taxes = await taxService.getAllTaxes();

      res.json({
        success: true,
        data: taxes,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /api/taxes/product/:productId
   * @summary Get taxes for a product
   * @returns {Tax[]} 200 - List of taxes for the product
   */
  async getTaxesByProductId(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = productIdParamSchema.parse(req.params);
      const taxes = await taxService.getTaxesByProductId(productId);

      res.json({
        success: true,
        data: taxes,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /api/taxes/:id
   * @summary Get tax by ID
   * @returns {Tax} 200 - Tax details
   */
  async getTaxById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = taxIdSchema.parse(req.params);
      const tax = await taxService.getTaxById(id);

      res.json({
        success: true,
        data: tax,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route POST /api/taxes
   * @summary Create new tax
   * @returns {Tax} 201 - Created tax
   */
  async createTax(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createTaxSchema.parse(req.body);
      const tax = await taxService.createTax(data);

      res.status(201).json({
        success: true,
        data: tax,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route PUT /api/taxes/:id
   * @summary Update tax
   * @returns {Tax} 200 - Updated tax
   */
  async updateTax(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = taxIdSchema.parse(req.params);
      const data = updateTaxSchema.parse(req.body);
      const tax = await taxService.updateTax(id, data);

      res.json({
        success: true,
        data: tax,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route DELETE /api/taxes/:id
   * @summary Delete tax
   * @returns {Object} 200 - Success message
   */
  async deleteTax(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = taxIdSchema.parse(req.params);
      await taxService.deleteTax(id);

      res.json({
        success: true,
        message: 'Tax deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new TaxController();
