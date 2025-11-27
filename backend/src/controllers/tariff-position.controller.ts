import { Request, Response, NextFunction } from 'express';
import tariffPositionService from '../services/tariff-position.service';
import {
  createTariffPositionSchema,
  updateTariffPositionSchema,
  tariffPositionIdSchema,
} from '../schemas/tariff-position.schema';

/**
 * Controller for TariffPosition endpoints
 */
export class TariffPositionController {
  /**
   * @route GET /api/tariff-positions
   * @summary Get all tariff positions
   * @returns {TariffPosition[]} 200 - List of tariff positions with pagination
   */
  async getAllTariffPositions(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;

      let result;
      if (search) {
        result = await tariffPositionService.searchTariffPositions(search, page, limit);
      } else {
        result = await tariffPositionService.getAllTariffPositions(page, limit);
      }

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
   * @route GET /api/tariff-positions/:id
   * @summary Get tariff position by ID
   * @returns {TariffPosition} 200 - Tariff position details
   */
  async getTariffPositionById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = tariffPositionIdSchema.parse(req.params);
      const tariffPosition = await tariffPositionService.getTariffPositionById(id);

      res.json({
        success: true,
        data: tariffPosition,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route POST /api/tariff-positions
   * @summary Create new tariff position
   * @returns {TariffPosition} 201 - Created tariff position
   */
  async createTariffPosition(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createTariffPositionSchema.parse(req.body);
      const tariffPosition = await tariffPositionService.createTariffPosition(data);

      res.status(201).json({
        success: true,
        data: tariffPosition,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route PUT /api/tariff-positions/:id
   * @summary Update tariff position
   * @returns {TariffPosition} 200 - Updated tariff position
   */
  async updateTariffPosition(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = tariffPositionIdSchema.parse(req.params);
      const data = updateTariffPositionSchema.parse(req.body);
      const tariffPosition = await tariffPositionService.updateTariffPosition(id, data);

      res.json({
        success: true,
        data: tariffPosition,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route DELETE /api/tariff-positions/:id
   * @summary Delete tariff position
   * @returns {Object} 200 - Success message
   */
  async deleteTariffPosition(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = tariffPositionIdSchema.parse(req.params);
      await tariffPositionService.deleteTariffPosition(id);

      res.json({
        success: true,
        message: 'Tariff position deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new TariffPositionController();
