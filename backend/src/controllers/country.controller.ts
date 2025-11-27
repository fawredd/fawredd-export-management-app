import { Request, Response, NextFunction } from 'express';
import countryService from '../services/country.service';
import {
  createCountrySchema,
  updateCountrySchema,
  countryIdSchema,
} from '../schemas/country.schema';

/**
 * Controller for Country endpoints
 */
export class CountryController {
  /**
   * @route GET /api/countries
   * @summary Get all countries
   * @returns {Country[]} 200 - List of countries
   */
  async getAllCountries(req: Request, res: Response, next: NextFunction) {
    try {
      const countries = await countryService.getAllCountries();

      res.json({
        success: true,
        data: countries,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /api/countries/:id
   * @summary Get country by ID
   * @returns {Country} 200 - Country details
   */
  async getCountryById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = countryIdSchema.parse(req.params);
      const country = await countryService.getCountryById(id);

      res.json({
        success: true,
        data: country,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route POST /api/countries
   * @summary Create new country
   * @returns {Country} 201 - Created country
   */
  async createCountry(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createCountrySchema.parse(req.body);
      const country = await countryService.createCountry(data);

      res.status(201).json({
        success: true,
        data: country,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route PUT /api/countries/:id
   * @summary Update country
   * @returns {Country} 200 - Updated country
   */
  async updateCountry(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = countryIdSchema.parse(req.params);
      const data = updateCountrySchema.parse(req.body);
      const country = await countryService.updateCountry(id, data);

      res.json({
        success: true,
        data: country,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route DELETE /api/countries/:id
   * @summary Delete country
   * @returns {Object} 200 - Success message
   */
  async deleteCountry(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = countryIdSchema.parse(req.params);
      await countryService.deleteCountry(id);

      res.json({
        success: true,
        message: 'Country deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CountryController();
