import packingListRepository from '../repositories/packing-list.repository';
import budgetRepository from '../repositories/budget.repository';
import { CreatePackingListInput, UpdatePackingListInput } from '../schemas/packing-list.schema';

/**
 * Service for PackingList business logic
 */
export class PackingListService {
  /**
   * Get all packing lists with filters
   */
  async getAllPackingLists(filters?: {
    budgetId?: string;
    page?: number;
    limit?: number;
  }) {
    return packingListRepository.findAll(filters);
  }

  /**
   * Get packing list by ID
   */
  async getPackingListById(id: string) {
    const packingList = await packingListRepository.findById(id);
    if (!packingList) {
      throw new Error('Packing list not found');
    }
    return packingList;
  }

  /**
   * Create new packing list from budget
   */
  async createPackingList(data: CreatePackingListInput) {
    // Verify budget exists and is approved
    const budget = await budgetRepository.findById(data.budgetId);
    if (!budget) {
      throw new Error('Budget not found');
    }

    if (budget.status !== 'APPROVED' && budget.status !== 'INVOICED') {
      throw new Error('Can only create packing lists from approved or invoiced budgets');
    }

    return packingListRepository.create(data);
  }

  /**
   * Update packing list
   */
  async updatePackingList(id: string, data: UpdatePackingListInput) {
    // Check if packing list exists
    await this.getPackingListById(id);

    return packingListRepository.update(id, data);
  }

  /**
   * Generate PDF for packing list
   */
  async generatePdf(id: string): Promise<string> {
    // Get packing list with full budget and client data
    const packingList = await packingListRepository.findById(id);
    if (!packingList) {
      throw new Error('Packing list not found');
    }

    // Import PDF generator service
    const { pdfGeneratorService } = await import('./pdf-generator.service');
    
    // Generate PDF
    const pdfUrl = await pdfGeneratorService.generatePackingList(packingList);

    // Update packing list with PDF URL
    await packingListRepository.updatePdfUrl(id, pdfUrl);

    return pdfUrl;
  }

  /**
   * Delete packing list
   */
  async deletePackingList(id: string) {
    // Check if packing list exists
    await this.getPackingListById(id);

    return packingListRepository.delete(id);
  }

  /**
   * Get packing lists by budget ID
   */
  async getPackingListsByBudgetId(budgetId: string) {
    // Verify budget exists
    const budget = await budgetRepository.findById(budgetId);
    if (!budget) {
      throw new Error('Budget not found');
    }

    return packingListRepository.findByBudgetId(budgetId);
  }

  /**
   * Auto-generate packing list details from budget
   */
  async autoGenerateFromBudget(budgetId: string) {
    const budget = await budgetRepository.findById(budgetId);
    if (!budget) {
      throw new Error('Budget not found');
    }

    // Generate packing list details from budget items
    const items = budget.budgetItems.map((item: any) => ({
      productId: item.productId,
      productName: item.product.title,
      quantity: item.quantity,
      weight: item.product.weightKg ? item.product.weightKg * item.quantity : undefined,
      volume: item.product.volumeM3 ? item.product.volumeM3 * item.quantity : undefined,
    }));

    const totalWeight = items.reduce((sum: number, item: any) => sum + (item.weight || 0), 0);
    const totalVolume = items.reduce((sum: number, item: any) => sum + (item.volume || 0), 0);

    const details = {
      items,
      totalWeight: totalWeight > 0 ? totalWeight : undefined,
      totalVolume: totalVolume > 0 ? totalVolume : undefined,
    };

    return this.createPackingList({
      budgetId,
      details,
    });
  }
}

export default new PackingListService();
