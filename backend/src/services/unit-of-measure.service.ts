import unitOfMeasureRepository from '../repositories/unit-of-measure.repository';
import { CreateUnitInput, UpdateUnitInput } from '../schemas/unit-of-measure.schema';

/**
 * Service for UnitOfMeasure business logic
 */
export class UnitOfMeasureService {
  /**
   * Get all units of measure
   */
  async getAllUnits() {
    return unitOfMeasureRepository.findAll();
  }

  /**
   * Get unit by ID
   */
  async getUnitById(id: string) {
    const unit = await unitOfMeasureRepository.findById(id);
    if (!unit) {
      throw new Error('Unit of measure not found');
    }
    return unit;
  }

  /**
   * Create new unit of measure
   */
  async createUnit(data: CreateUnitInput) {
    // Check if abbreviation already exists
    const existing = await unitOfMeasureRepository.findByAbbreviation(data.abbreviation);
    if (existing) {
      throw new Error(`Unit with abbreviation ${data.abbreviation} already exists`);
    }

    return unitOfMeasureRepository.create(data);
  }

  /**
   * Update unit of measure
   */
  async updateUnit(id: string, data: UpdateUnitInput) {
    // Check if unit exists
    await this.getUnitById(id);

    // If updating abbreviation, check if new abbreviation already exists
    if (data.abbreviation) {
      const existing = await unitOfMeasureRepository.findByAbbreviation(data.abbreviation);
      if (existing && existing.id !== id) {
        throw new Error(`Unit with abbreviation ${data.abbreviation} already exists`);
      }
    }

    return unitOfMeasureRepository.update(id, data);
  }

  /**
   * Delete unit of measure
   */
  async deleteUnit(id: string) {
    // Check if unit exists
    const unit = await this.getUnitById(id);

    // Check if it's being used by products
    if (unit.products && unit.products.length > 0) {
      throw new Error('Cannot delete unit that is being used by products');
    }

    return unitOfMeasureRepository.delete(id);
  }
}

export default new UnitOfMeasureService();
