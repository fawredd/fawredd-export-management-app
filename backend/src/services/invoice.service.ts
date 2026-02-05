import invoiceRepository from '../repositories/invoice.repository';
import budgetRepository from '../repositories/budget.repository';
import { CreateInvoiceInput, UpdateInvoiceInput } from '../schemas/invoice.schema';

/**
 * Service for Invoice business logic
 */
export class InvoiceService {
  /**
   * Get all invoices with filters
   */
  async getAllInvoices(filters?: { budgetId?: string; page?: number; limit?: number }) {
    return invoiceRepository.findAll(filters);
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(id: string) {
    const invoice = await invoiceRepository.findById(id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    return invoice;
  }

  /**
   * Create new invoice from budget
   */
  async createInvoice(data: CreateInvoiceInput) {
    // Verify budget exists and is approved
    const budget = await budgetRepository.findById(data.budgetId);
    if (!budget) {
      throw new Error('Budget not found');
    }

    if (budget.status !== 'APPROVED') {
      throw new Error('Can only create invoices from approved budgets');
    }

    // Check if invoice number already exists
    const existing = await invoiceRepository.findByInvoiceNumber(data.invoiceNumber);
    if (existing) {
      throw new Error(`Invoice number ${data.invoiceNumber} already exists`);
    }

    // Convert date strings to Date if needed
    const invoiceData = {
      ...data,
      issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    };

    // Create invoice and update budget status
    const invoice = await invoiceRepository.create(invoiceData);

    // Update budget status to INVOICED
    await budgetRepository.update(data.budgetId, { status: 'INVOICED' });

    return invoice;
  }

  /**
   * Update invoice
   */
  async updateInvoice(id: string, data: UpdateInvoiceInput) {
    // Check if invoice exists
    await this.getInvoiceById(id);

    // If updating invoice number, check if new number already exists
    if (data.invoiceNumber) {
      const existing = await invoiceRepository.findByInvoiceNumber(data.invoiceNumber);
      if (existing && existing.id !== id) {
        throw new Error(`Invoice number ${data.invoiceNumber} already exists`);
      }
    }

    // Convert date strings to Date if needed
    const invoiceData: any = { ...data };
    if (data.issueDate) {
      invoiceData.issueDate = new Date(data.issueDate);
    }
    if (data.dueDate) {
      invoiceData.dueDate = new Date(data.dueDate);
    }

    return invoiceRepository.update(id, invoiceData);
  }

  /**
   * Generate PDF for invoice
   */
  async generatePdf(id: string): Promise<string> {
    // Get invoice with full budget and client data
    const invoice = await invoiceRepository.findById(id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Import PDF generator service
    const { pdfGeneratorService } = await import('./pdf-generator.service');

    // Generate PDF
    const pdfUrl = await pdfGeneratorService.generateInvoice(invoice);

    // Update invoice with PDF URL
    await invoiceRepository.updatePdfUrl(id, pdfUrl);

    return pdfUrl;
  }

  /**
   * Delete invoice
   */
  async deleteInvoice(id: string) {
    // Check if invoice exists
    const invoice = await this.getInvoiceById(id);

    // Revert budget status if needed
    await budgetRepository.update(invoice.budgetId, { status: 'APPROVED' });

    return invoiceRepository.delete(id);
  }

  /**
   * Get invoices by budget ID
   */
  async getInvoicesByBudgetId(budgetId: string) {
    // Verify budget exists
    const budget = await budgetRepository.findById(budgetId);
    if (!budget) {
      throw new Error('Budget not found');
    }

    return invoiceRepository.findByBudgetId(budgetId);
  }
}

export default new InvoiceService();
