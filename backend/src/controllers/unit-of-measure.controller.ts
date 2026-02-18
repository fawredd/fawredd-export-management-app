import { Request, Response, NextFunction } from 'express';
import unitOfMeasureService from '../services/unit-of-measure.service';
import {
  createUnitSchema,
  updateUnitSchema,
  unitIdSchema,
} from '../schemas/unit-of-measure.schema';

/**
 * Controller for UnitOfMeasure endpoints
 */
export class UnitOfMeasureController {
  /**
   * @route GET /api/units
   * @summary Get all units of measure
   * @returns {UnitOfMeasure[]} 200 - List of units
   */
  async getAllUnits(_req: Request, res: Response, next: NextFunction) {
    try {
      const units = await unitOfMeasureService.getAllUnits();

      res.json({
        success: true,
        data: units,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /api/units/:id
   * @summary Get unit by ID
   * @returns {UnitOfMeasure} 200 - Unit details
   */
  async getUnitById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = unitIdSchema.parse(req.params);
      const unit = await unitOfMeasureService.getUnitById(id);

      res.json({
        success: true,
        data: unit,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route POST /api/units
   * @summary Create new unit of measure
   * @returns {UnitOfMeasure} 201 - Created unit
   */
  async createUnit(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createUnitSchema.parse(req.body);
      const unit = await unitOfMeasureService.createUnit(data);

      res.status(201).json({
        success: true,
        data: unit,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route PUT /api/units/:id
   * @summary Update unit of measure
   * @returns {UnitOfMeasure} 200 - Updated unit
   */
  async updateUnit(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = unitIdSchema.parse(req.params);
      const data = updateUnitSchema.parse(req.body);
      const unit = await unitOfMeasureService.updateUnit(id, data);

      res.json({
        success: true,
        data: unit,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route DELETE /api/units/:id
   * @summary Delete unit of measure
   * @returns {Object} 200 - Success message
   */
  async deleteUnit(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = unitIdSchema.parse(req.params);
      await unitOfMeasureService.deleteUnit(id);

      res.json({
        success: true,
        message: 'Unit of measure deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UnitOfMeasureController();
