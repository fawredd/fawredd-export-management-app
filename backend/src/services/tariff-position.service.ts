import tariffPositionRepository from '../repositories/tariff-position.repository';
import { CreateTariffPositionInput, UpdateTariffPositionInput } from '../schemas/tariff-position.schema';

/**
 * Service for TariffPosition business logic
 */
export class TariffPositionService {
  /**
   * Get all tariff positions with pagination
   */
  async getAllTariffPositions(page: number = 1, limit: number = 20) {
    return tariffPositionRepository.findAll(page, limit);
  }

  /**
   * Get tariff position by ID
   */
  async getTariffPositionById(id: string) {
    const tariffPosition = await tariffPositionRepository.findById(id);
    if (!tariffPosition) {
      throw new Error('Tariff position not found');
    }
    return tariffPosition;
  }

  /**
   * Create new tariff position
   */
  async createTariffPosition(data: CreateTariffPositionInput) {
    // Check if code already exists
    const existing = await tariffPositionRepository.findByCode(data.code);
    if (existing) {
      throw new Error(`Tariff position with code ${data.code} already exists`);
    }

    return tariffPositionRepository.create(data);
  }

  /**
   * Update tariff position
   */
  async updateTariffPosition(id: string, data: UpdateTariffPositionInput) {
    // Check if tariff position exists
    await this.getTariffPositionById(id);

    // If updating code, check if new code already exists
    if (data.code) {
      const existing = await tariffPositionRepository.findByCode(data.code);
      if (existing && existing.id !== id) {
        throw new Error(`Tariff position with code ${data.code} already exists`);
      }
    }

    return tariffPositionRepository.update(id, data);
  }

  /**
   * Delete tariff position
   */
  async deleteTariffPosition(id: string) {
    // Check if tariff position exists
    const tariffPosition = await this.getTariffPositionById(id);

    // Check if it's being used by products
    if (tariffPosition.products && tariffPosition.products.length > 0) {
      throw new Error('Cannot delete tariff position that is being used by products');
    }

    return tariffPositionRepository.delete(id);
  }

  /**
   * Search tariff positions
   */
  async searchTariffPositions(query: string, page: number = 1, limit: number = 20) {
    return tariffPositionRepository.search(query, page, limit);
  }
}

export default new TariffPositionService();
