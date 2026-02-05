import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * PDF Generator Service
 * Generates PDF documents for invoices and packing lists
 */

// Ensure PDFs directory exists
const pdfsDir = path.join(__dirname, '../../uploads/pdfs');
if (!fs.existsSync(pdfsDir)) {
  fs.mkdirSync(pdfsDir, { recursive: true });
}

export class PdfGeneratorService {
  /**
   * Generate Invoice PDF
   */
  async generateInvoice(invoiceData: any): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const filename = `invoice-${invoiceData.id}-${Date.now()}.pdf`;
        const filepath = path.join(pdfsDir, filename);
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filepath);

        doc.pipe(stream);

        // Header
        doc.fontSize(20).text('PROFORMA INVOICE', { align: 'center' });
        doc.moveDown();

        // Invoice Info
        doc.fontSize(10);
        doc.text(`Invoice Number: ${invoiceData.invoiceNumber}`, 50, 100);
        doc.text(`Date: ${new Date(invoiceData.issueDate).toLocaleDateString()}`, 50, 115);
        doc.text(`Status: ${invoiceData.status}`, 50, 130);

        // Client Info
        doc.text('Bill To:', 50, 160);
        doc.fontSize(12).text(invoiceData.budget?.client?.name || 'N/A', 50, 175);
        if (invoiceData.budget?.client?.email) {
          doc.fontSize(10).text(invoiceData.budget.client.email, 50, 190);
        }
        if (invoiceData.budget?.client?.address) {
          doc.text(invoiceData.budget.client.address, 50, 205);
        }

        // Budget Info
        doc.text(`Incoterm: ${invoiceData.budget?.incoterm || 'N/A'}`, 350, 160);
        doc.text(`Total Amount: $${Number(invoiceData.totalAmount).toFixed(2)}`, 350, 175);

        // Line separator
        doc.moveTo(50, 240).lineTo(550, 240).stroke();

        // Items Table Header
        let yPosition = 260;
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Item', 50, yPosition);
        doc.text('Qty', 300, yPosition);
        doc.text('Unit Price', 370, yPosition);
        doc.text('Total', 480, yPosition);

        yPosition += 20;
        doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
        yPosition += 10;

        // Items
        doc.font('Helvetica');
        if (invoiceData.budget?.budgetItems) {
          for (const item of invoiceData.budget.budgetItems) {
            if (yPosition > 700) {
              doc.addPage();
              yPosition = 50;
            }

            doc.text(item.product?.title || 'Product', 50, yPosition, { width: 240 });
            doc.text(item.quantity.toString(), 300, yPosition);
            doc.text(`$${Number(item.unitPrice).toFixed(2)}`, 370, yPosition);
            doc.text(`$${Number(item.totalLine).toFixed(2)}`, 480, yPosition);
            yPosition += 25;
          }
        }

        // Total
        yPosition += 20;
        doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
        yPosition += 15;
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text('TOTAL:', 370, yPosition);
        doc.text(`$${Number(invoiceData.totalAmount).toFixed(2)}`, 480, yPosition);

        // Footer
        doc.fontSize(8).font('Helvetica');
        doc.text('This is a proforma invoice and does not constitute a tax invoice.', 50, 750, {
          align: 'center',
          width: 500,
        });

        doc.end();

        stream.on('finish', () => {
          resolve(`/uploads/pdfs/${filename}`);
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate Packing List PDF
   */
  async generatePackingList(packingListData: any): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const filename = `packing-list-${packingListData.id}-${Date.now()}.pdf`;
        const filepath = path.join(pdfsDir, filename);
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filepath);

        doc.pipe(stream);

        // Header
        doc.fontSize(20).text('PACKING LIST', { align: 'center' });
        doc.moveDown();

        // Packing List Info
        doc.fontSize(10);
        doc.text(`Packing List Number: ${packingListData.listNumber}`, 50, 100);
        doc.text(`Date: ${new Date(packingListData.issueDate).toLocaleDateString()}`, 50, 115);

        // Client Info
        doc.text('Ship To:', 50, 145);
        doc.fontSize(12).text(packingListData.budget?.client?.name || 'N/A', 50, 160);
        if (packingListData.budget?.client?.address) {
          doc.fontSize(10).text(packingListData.budget.client.address, 50, 175);
        }

        // Shipping Info
        doc.text(`Total Weight: ${Number(packingListData.totalWeight).toFixed(2)} kg`, 350, 145);
        doc.text(`Total Volume: ${Number(packingListData.totalVolume).toFixed(3)} m³`, 350, 160);
        doc.text(`Number of Packages: ${packingListData.numberOfPackages}`, 350, 175);

        // Line separator
        doc.moveTo(50, 210).lineTo(550, 210).stroke();

        // Items Table Header
        let yPosition = 230;
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Item', 50, yPosition);
        doc.text('SKU', 250, yPosition);
        doc.text('Qty', 350, yPosition);
        doc.text('Weight (kg)', 420, yPosition);

        yPosition += 20;
        doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
        yPosition += 10;

        // Items
        doc.font('Helvetica');
        if (packingListData.budget?.budgetItems) {
          for (const item of packingListData.budget.budgetItems) {
            if (yPosition > 700) {
              doc.addPage();
              yPosition = 50;
            }

            const productWeight = item.product?.weightKg
              ? (item.product.weightKg * item.quantity).toFixed(2)
              : 'N/A';

            doc.text(item.product?.title || 'Product', 50, yPosition, { width: 190 });
            doc.text(item.product?.sku || 'N/A', 250, yPosition);
            doc.text(item.quantity.toString(), 350, yPosition);
            doc.text(productWeight, 420, yPosition);
            yPosition += 25;
          }
        }

        // Summary
        yPosition += 20;
        doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
        yPosition += 15;
        doc.fontSize(11).font('Helvetica-Bold');
        doc.text('TOTALS:', 50, yPosition);
        doc.text(`Weight: ${Number(packingListData.totalWeight).toFixed(2)} kg`, 350, yPosition);
        yPosition += 15;
        doc.text(`Volume: ${Number(packingListData.totalVolume).toFixed(3)} m³`, 350, yPosition);
        yPosition += 15;
        doc.text(`Packages: ${packingListData.numberOfPackages}`, 350, yPosition);

        // Footer
        doc.fontSize(8).font('Helvetica');
        doc.text('Please verify all items upon receipt.', 50, 750, { align: 'center', width: 500 });

        doc.end();

        stream.on('finish', () => {
          resolve(`/uploads/pdfs/${filename}`);
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }
}

export const pdfGeneratorService = new PdfGeneratorService();
