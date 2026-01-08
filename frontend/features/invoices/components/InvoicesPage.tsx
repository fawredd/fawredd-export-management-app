import Link from 'next/link';

export default function InvoicesPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <Link
          href="/invoices/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Create Invoice
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <p className="text-gray-600">
            Invoices list will be displayed here with budget information and PDF generation.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            This page needs to be connected to the API endpoint: GET /api/invoices
          </p>
        </div>
      </div>
    </div>
  );
}
