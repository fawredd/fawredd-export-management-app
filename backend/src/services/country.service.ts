import countryRepository from '../repositories/country.repository';
import { CreateCountryInput, UpdateCountryInput } from '../schemas/country.schema';

/**
 * Service for Country business logic
 */
export class CountryService {
  /**
   * Get all countries
   */
  async getAllCountries() {
    return countryRepository.findAll();
  }

  /**
   * Get country by ID
   */
  async getCountryById(id: string) {
    const country = await countryRepository.findById(id);
    if (!country) {
      throw new Error('Country not found');
    }
    return country;
  }

  /**
   * Create new country
   */
  async createCountry(data: CreateCountryInput) {
    // Normalize code to uppercase
    const normalizedData = {
      ...data,
      code: data.code.toUpperCase(),
    };

    // Check if code already exists
    const existing = await countryRepository.findByCode(normalizedData.code);
    if (existing) {
      throw new Error(`Country with code ${normalizedData.code} already exists`);
    }

    return countryRepository.create(normalizedData);
  }

  /**
   * Update country
   */
  async updateCountry(id: string, data: UpdateCountryInput) {
    // Check if country exists
    await this.getCountryById(id);

    // Normalize code if provided
    const normalizedData = data.code
      ? { ...data, code: data.code.toUpperCase() }
      : data;

    // If updating code, check if new code already exists
    if (normalizedData.code) {
      const existing = await countryRepository.findByCode(normalizedData.code);
      if (existing && existing.id !== id) {
        throw new Error(`Country with code ${normalizedData.code} already exists`);
      }
    }

    return countryRepository.update(id, normalizedData);
  }

  /**
   * Delete country
   */
  async deleteCountry(id: string) {
    // Check if country exists
    const country = await this.getCountryById(id);

    // Check if it's being used by export tasks
    if (country.exportTasks && country.exportTasks.length > 0) {
      throw new Error('Cannot delete country that has export tasks');
    }

    return countryRepository.delete(id);
  }
}

export default new CountryService();
