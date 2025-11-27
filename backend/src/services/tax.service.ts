import taxRepository from '../repositories/tax.repository';
import productRepository from '../repositories/product.repository';
import { CreateTaxInput, UpdateTaxInput } from '../schemas/tax.schema';

/**
 * Service for Tax business logic
 */
export class TaxService {
  /**
   * Get all taxes
   */
  async getAllTaxes() {
    return taxRepository.findAll();
  }

  /**
   * Get tax by ID
   */
  async getTaxById(id: string) {
    const tax = await taxRepository.findById(id);
    if (!tax) {
      throw new Error('Tax not found');
    }
    return tax;
  }

  /**
   * Get taxes by product ID
   */
  async getTaxesByProductId(productId: string) {
    // Verify product exists
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    return taxRepository.findByProductId(productId);
  }

  /**
   * Create new tax
   */
  async createTax(data: CreateTaxInput) {
    // Verify product exists
    const product = await productRepository.findById(data.productId);
    if (!product) {
      throw new Error('Product not found');
    }

    return taxRepository.create(data);
  }

  /**
   * Update tax
   */
  async updateTax(id: string, data: UpdateTaxInput) {
    // Check if tax exists
    await this.getTaxById(id);

    return taxRepository.update(id, data);
  }

  /**
   * Delete tax
   */
  async deleteTax(id: string) {
    // Check if tax exists
    await this.getTaxById(id);

    return taxRepository.delete(id);
  }

  /**
   * Get total tax percentage for a product
   */
  async getTotalTaxPercentage(productId: string): Promise<number> {
    // Verify product exists
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    return taxRepository.getTotalTaxPercentage(productId);
  }
}

export default new TaxService();
