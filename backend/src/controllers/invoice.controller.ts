import { Request, Response, NextFunction } from 'express';
import invoiceService from '../services/invoice.service';
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  invoiceIdSchema,
} from '../schemas/invoice.schema';

/**
 * Controller for Invoice endpoints
 */
export class InvoiceController {
  /**
   * @route GET /api/invoices
   * @summary Get all invoices
   * @returns {Invoice[]} 200 - List of invoices with pagination
   */
  async getAllInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const budgetId = req.query.budgetId as string;

      const result = await invoiceService.getAllInvoices({
        budgetId,
        page,
        limit,
        organizationId: (req as any).user?.organizationId,
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /api/invoices/:id
   * @summary Get invoice by ID
   * @returns {Invoice} 200 - Invoice details
   */
  async getInvoiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = invoiceIdSchema.parse(req.params);
      const invoice = await invoiceService.getInvoiceById(id, (req as any).user?.organizationId);

      res.json({
        success: true,
        data: invoice,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route POST /api/invoices
   * @summary Create new invoice from budget
   * @returns {Invoice} 201 - Created invoice
   */
  async createInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createInvoiceSchema.parse(req.body);
      const invoice = await invoiceService.createInvoice({
        ...data,
        organizationId: (req as any).user?.organizationId,
      });

      res.status(201).json({
        success: true,
        data: invoice,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route PUT /api/invoices/:id
   * @summary Update invoice
   * @returns {Invoice} 200 - Updated invoice
   */
  async updateInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = invoiceIdSchema.parse(req.params);
      const data = updateInvoiceSchema.parse(req.body);
      const invoice = await invoiceService.updateInvoice(
        id,
        data,
        (req as any).user?.organizationId,
      );

      res.json({
        success: true,
        data: invoice,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route POST /api/invoices/:id/generate-pdf
   * @summary Generate PDF for invoice
   * @returns {Object} 200 - PDF URL
   */
  async generatePdf(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = invoiceIdSchema.parse(req.params);
      const pdfUrl = await invoiceService.generatePdf(id);

      res.json({
        success: true,
        data: { pdfUrl },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route DELETE /api/invoices/:id
   * @summary Delete invoice
   * @returns {Object} 200 - Success message
   */
  async deleteInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = invoiceIdSchema.parse(req.params);
      await invoiceService.deleteInvoice(id, (req as any).user?.organizationId);

      res.json({
        success: true,
        message: 'Invoice deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new InvoiceController();
