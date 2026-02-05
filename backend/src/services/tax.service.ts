import taxRepository from '../repositories/tax.repository';
import { ProductRepository } from '../repositories/product.repository';

const productRepository = new ProductRepository();
import { CreateTaxInput, UpdateTaxInput } from '../schemas/tax.schema';

/**
 * Service for Tax business logic
 */
export class TaxService {
  /**
   * Get all taxes
   */
  async getAllTaxes(organizationId?: string | null) {
    return taxRepository.findAll(organizationId);
  }

  /**
   * Get tax by ID
   */
  async getTaxById(id: string, organizationId?: string | null) {
    const tax = await taxRepository.findById(id, organizationId);
    if (!tax) {
      throw new Error('Tax not found');
    }
    return tax;
  }

  /**
   * Get taxes by product ID
   */
  async getTaxesByProductId(productId: string, organizationId?: string | null) {
    // Verify product exists
    const product = await productRepository.findById(productId, organizationId);
    if (!product) {
      throw new Error('Product not found');
    }

    return taxRepository.findByProductId(productId, organizationId);
  }

  /**
   * Create new tax
   */
  async createTax(data: CreateTaxInput & { organizationId?: string | null }) {
    // Verify product exists
    const product = await productRepository.findById(data.productId, data.organizationId);
    if (!product) {
      throw new Error('Product not found');
    }

    return taxRepository.create(data);
  }

  /**
   * Update tax
   */
  async updateTax(id: string, data: UpdateTaxInput, organizationId?: string | null) {
    // Check if tax exists
    await this.getTaxById(id, organizationId);

    return taxRepository.update(id, data, organizationId);
  }

  /**
   * Delete tax
   */
  async deleteTax(id: string, organizationId?: string | null) {
    // Check if tax exists
    await this.getTaxById(id, organizationId);

    return taxRepository.delete(id, organizationId);
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
