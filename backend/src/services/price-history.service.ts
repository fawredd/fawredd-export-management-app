import priceHistoryRepository from '../repositories/price-history.repository';
import { ProductRepository } from '../repositories/product.repository';

const productRepository = new ProductRepository();
import { CreatePriceHistoryInput, PriceType } from '../schemas/price-history.schema';

/**
 * Service for PriceHistory business logic
 */
export class PriceHistoryService {
  /**
   * Get price history by product ID
   */
  async getPriceHistoryByProductId(productId: string, type?: PriceType) {
    // Verify product exists
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    return priceHistoryRepository.findByProductId(productId, type);
  }

  /**
   * Get price history by ID
   */
  async getPriceHistoryById(id: string) {
    const priceHistory = await priceHistoryRepository.findById(id);
    if (!priceHistory) {
      throw new Error('Price history entry not found');
    }
    return priceHistory;
  }

  /**
   * Create new price history entry
   */
  async createPriceHistory(data: CreatePriceHistoryInput) {
    // Verify product exists
    const product = await productRepository.findById(data.productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Convert date string to Date if needed
    const priceData = {
      ...data,
      date: data.date ? new Date(data.date) : new Date(),
    };

    return priceHistoryRepository.create(priceData);
  }

  /**
   * Delete price history entry
   */
  async deletePriceHistory(id: string) {
    // Check if entry exists
    await this.getPriceHistoryById(id);

    return priceHistoryRepository.delete(id);
  }

  /**
   * Get latest price for a product
   */
  async getLatestPrice(productId: string, type: PriceType) {
    // Verify product exists
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    return priceHistoryRepository.getLatestPrice(productId, type);
  }

  /**
   * Get price history within date range
   */
  async getPriceHistoryByDateRange(
    productId: string,
    startDate: Date,
    endDate: Date,
    type?: PriceType,
  ) {
    // Verify product exists
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    return priceHistoryRepository.findByDateRange(productId, startDate, endDate, type);
  }
}

export default new PriceHistoryService();
