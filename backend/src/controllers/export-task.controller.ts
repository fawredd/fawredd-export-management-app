import { Request, Response, NextFunction } from 'express';
import exportTaskService from '../services/export-task.service';
import {
  createExportTaskSchema,
  updateExportTaskSchema,
  updateTaskStatusSchema,
  exportTaskIdSchema,
  taskStatusSchema,
} from '../schemas/export-task.schema';

/**
 * Controller for ExportTask endpoints
 */
export class ExportTaskController {
  /**
   * @route GET /api/export-tasks
   * @summary Get all export tasks
   * @returns {ExportTask[]} 200 - List of export tasks with pagination
   */
  async getAllExportTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const countryId = req.query.countryId as string;
      const status = req.query.status ? taskStatusSchema.parse(req.query.status) : undefined;

      const result = await exportTaskService.getAllExportTasks({
        countryId,
        status,
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
   * @route GET /api/export-tasks/:id
   * @summary Get export task by ID
   * @returns {ExportTask} 200 - Export task details
   */
  async getExportTaskById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = exportTaskIdSchema.parse(req.params);
      const exportTask = await exportTaskService.getExportTaskById(id);

      res.json({
        success: true,
        data: exportTask,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route POST /api/export-tasks
   * @summary Create new export task
   * @returns {ExportTask} 201 - Created export task
   */
  async createExportTask(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createExportTaskSchema.parse(req.body);
      const exportTask = await exportTaskService.createExportTask(data);

      res.status(201).json({
        success: true,
        data: exportTask,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route PUT /api/export-tasks/:id
   * @summary Update export task
   * @returns {ExportTask} 200 - Updated export task
   */
  async updateExportTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = exportTaskIdSchema.parse(req.params);
      const data = updateExportTaskSchema.parse(req.body);
      const exportTask = await exportTaskService.updateExportTask(id, data);

      res.json({
        success: true,
        data: exportTask,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route PATCH /api/export-tasks/:id/status
   * @summary Update export task status
   * @returns {ExportTask} 200 - Updated export task
   */
  async updateTaskStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = exportTaskIdSchema.parse(req.params);
      const data = updateTaskStatusSchema.parse(req.body);
      const exportTask = await exportTaskService.updateTaskStatus(id, data);

      res.json({
        success: true,
        data: exportTask,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route DELETE /api/export-tasks/:id
   * @summary Delete export task
   * @returns {Object} 200 - Success message
   */
  async deleteExportTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = exportTaskIdSchema.parse(req.params);
      await exportTaskService.deleteExportTask(id);

      res.json({
        success: true,
        message: 'Export task deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ExportTaskController();
