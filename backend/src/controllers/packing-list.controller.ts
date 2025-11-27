import { Request, Response, NextFunction } from 'express';
import packingListService from '../services/packing-list.service';
import {
  createPackingListSchema,
  updatePackingListSchema,
  packingListIdSchema,
} from '../schemas/packing-list.schema';

/**
 * Controller for PackingList endpoints
 */
export class PackingListController {
  /**
   * @route GET /api/packing-lists
   * @summary Get all packing lists
   * @returns {PackingList[]} 200 - List of packing lists with pagination
   */
  async getAllPackingLists(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const budgetId = req.query.budgetId as string;

      const result = await packingListService.getAllPackingLists({
        budgetId,
        page,
        limit,
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /api/packing-lists/:id
   * @summary Get packing list by ID
   * @returns {PackingList} 200 - Packing list details
   */
  async getPackingListById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = packingListIdSchema.parse(req.params);
      const packingList = await packingListService.getPackingListById(id);

      res.json({
        success: true,
        data: packingList,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route POST /api/packing-lists
   * @summary Create new packing list from budget
   * @returns {PackingList} 201 - Created packing list
   */
  async createPackingList(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createPackingListSchema.parse(req.body);
      const packingList = await packingListService.createPackingList(data);

      res.status(201).json({
        success: true,
        data: packingList,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route POST /api/packing-lists/auto-generate
   * @summary Auto-generate packing list from budget
   * @returns {PackingList} 201 - Created packing list
   */
  async autoGenerateFromBudget(req: Request, res: Response, next: NextFunction) {
    try {
      const { budgetId } = req.body;
      if (!budgetId) {
        throw new Error('budgetId is required');
      }

      const packingList = await packingListService.autoGenerateFromBudget(budgetId);

      res.status(201).json({
        success: true,
        data: packingList,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route PUT /api/packing-lists/:id
   * @summary Update packing list
   * @returns {PackingList} 200 - Updated packing list
   */
  async updatePackingList(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = packingListIdSchema.parse(req.params);
      const data = updatePackingListSchema.parse(req.body);
      const packingList = await packingListService.updatePackingList(id, data);

      res.json({
        success: true,
        data: packingList,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route POST /api/packing-lists/:id/generate-pdf
   * @summary Generate PDF for packing list
   * @returns {Object} 200 - PDF URL
   */
  async generatePdf(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = packingListIdSchema.parse(req.params);
      const pdfUrl = await packingListService.generatePdf(id);

      res.json({
        success: true,
        data: { pdfUrl },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route DELETE /api/packing-lists/:id
   * @summary Delete packing list
   * @returns {Object} 200 - Success message
   */
  async deletePackingList(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = packingListIdSchema.parse(req.params);
      await packingListService.deletePackingList(id);

      res.json({
        success: true,
        message: 'Packing list deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PackingListController();
