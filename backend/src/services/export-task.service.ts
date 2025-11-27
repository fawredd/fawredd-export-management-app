import exportTaskRepository from '../repositories/export-task.repository';
import countryRepository from '../repositories/country.repository';
import { CreateExportTaskInput, UpdateExportTaskInput, UpdateTaskStatusInput, TaskStatus } from '../schemas/export-task.schema';

/**
 * Service for ExportTask business logic
 */
export class ExportTaskService {
  /**
   * Get all export tasks with filters
   */
  async getAllExportTasks(filters?: {
    countryId?: string;
    status?: TaskStatus;
    page?: number;
    limit?: number;
  }) {
    return exportTaskRepository.findAll(filters);
  }

  /**
   * Get export task by ID
   */
  async getExportTaskById(id: string) {
    const exportTask = await exportTaskRepository.findById(id);
    if (!exportTask) {
      throw new Error('Export task not found');
    }
    return exportTask;
  }

  /**
   * Create new export task
   */
  async createExportTask(data: CreateExportTaskInput) {
    // Verify country exists
    const country = await countryRepository.findById(data.countryId);
    if (!country) {
      throw new Error('Country not found');
    }

    // Convert date string to Date if needed
    const taskData = {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    };

    return exportTaskRepository.create(taskData);
  }

  /**
   * Update export task
   */
  async updateExportTask(id: string, data: UpdateExportTaskInput) {
    // Check if task exists
    await this.getExportTaskById(id);

    // Verify country if being updated
    if (data.countryId) {
      const country = await countryRepository.findById(data.countryId);
      if (!country) {
        throw new Error('Country not found');
      }
    }

    // Convert date strings to Date if needed
    const taskData: any = { ...data };
    if (data.dueDate) {
      taskData.dueDate = new Date(data.dueDate);
    }

    return exportTaskRepository.update(id, taskData);
  }

  /**
   * Update task status
   */
  async updateTaskStatus(id: string, data: UpdateTaskStatusInput) {
    // Check if task exists
    await this.getExportTaskById(id);

    const completedAt = data.completedAt ? new Date(data.completedAt) : undefined;

    return exportTaskRepository.updateStatus(id, data.status, completedAt);
  }

  /**
   * Delete export task
   */
  async deleteExportTask(id: string) {
    // Check if task exists
    await this.getExportTaskById(id);

    return exportTaskRepository.delete(id);
  }

  /**
   * Get tasks by country
   */
  async getTasksByCountry(countryId: string) {
    // Verify country exists
    const country = await countryRepository.findById(countryId);
    if (!country) {
      throw new Error('Country not found');
    }

    return exportTaskRepository.findByCountry(countryId);
  }

  /**
   * Get tasks by status
   */
  async getTasksByStatus(status: TaskStatus) {
    return exportTaskRepository.findByStatus(status);
  }
}

export default new ExportTaskService();
