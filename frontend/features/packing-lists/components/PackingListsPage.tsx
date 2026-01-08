import Link from 'next/link';

export default function PackingListsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Packing Lists</h1>
        <Link
          href="/packing-lists/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Create Packing List
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <p className="text-gray-600">
            Packing lists will be displayed here with auto-generation and PDF export options.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            This page needs to be connected to the API endpoint: GET /api/packing-lists
          </p>
        </div>
      </div>
    </div>
  );
}
