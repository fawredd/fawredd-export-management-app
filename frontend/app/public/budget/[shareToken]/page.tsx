'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

interface BudgetItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalLine: number;
  product: {
    id: string;
    sku: string;
    title: string;
    description: string | null;
    imageUrls: string[];
    unit: { abbreviation: string } | null;
  };
}

interface Budget {
  id: string;
  incoterm: string;
  status: string;
  totalAmount: number;
  viewCount: number;
  client: {
    name: string;
    email: string | null;
  };
  budgetItems: BudgetItem[];
  costs: Array<{
    type: string;
    description: string | null;
    value: number;
  }>;
}

export default function PublicBudgetPage() {
  const params = useParams();
  const shareToken = params.shareToken as string;

  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [showAcceptForm, setShowAcceptForm] = useState(false);

  const [formData, setFormData] = useState({
    prospectName: '',
    prospectEmail: '',
    prospectPhone: '',
    prospectAddress: '',
    prospectTaxId: '',
  });

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(`${apiUrl}/api/public/budget/${shareToken}`);

        if (!response.ok) {
          if (response.status === 410) {
            throw new Error('This budget link has expired');
          }
          throw new Error('Budget not found');
        }

        const budgetData = await response.json();
        setBudget(budgetData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load budget');
      } finally {
        setLoading(false);
      }
    };

    if (shareToken) {
      fetchBudget();
    }
  }, [shareToken]);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccepting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/public/budget/${shareToken}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to accept budget');
      }

      const _result = await response.json();
      alert('Budget accepted successfully! The manufacturer has been notified.');
      setShowAcceptForm(false);
      // Refresh budget data
      const budgetData = await fetch(`${apiUrl}/api/public/budget/${shareToken}`).then(r => r.json());
      setBudget(budgetData);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to accept budget');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading budget...</p>
        </div>
      </div>
    );
  }

  if (error || !budget) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Budget Not Available</h1>
          <p className="text-gray-600">{error || 'This budget does not exist or the link has expired.'}</p>
        </div>
      </div>
    );
  }

  const isAccepted = budget.status === 'APPROVED';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Budget Proposal</h1>
              <p className="text-gray-600 mt-1">For: {budget.client.name}</p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${isAccepted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                {budget.status}
              </span>
              <p className="text-sm text-gray-500 mt-2">Views: {budget.viewCount}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Incoterm:</span>
              <span className="ml-2 text-gray-900">{budget.incoterm}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Total Amount:</span>
              <span className="ml-2 text-gray-900 font-bold text-lg">
                ${Number(budget.totalAmount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Budget Items */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Products</h2>
          <div className="space-y-4">
            {budget.budgetItems.map((item) => (
              <div key={item.id} className="flex gap-4 border-b pb-4 last:border-b-0">
                {item.product.imageUrls && item.product.imageUrls.length > 0 ? (
                  <Image
                    src={item.product.imageUrls[0]}
                    alt={item.product.title}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.product.title}</h3>
                  <p className="text-sm text-gray-500">SKU: {item.product.sku}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      <span>{item.quantity} {item.product.unit?.abbreviation || 'units'}</span>
                      <span className="mx-2">×</span>
                      <span>${Number(item.unitPrice).toFixed(2)}</span>
                    </div>
                    <div className="font-semibold text-gray-900">
                      ${Number(item.totalLine).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Costs */}
        {budget.costs && budget.costs.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Costs</h2>
            <div className="space-y-2">
              {budget.costs.map((cost, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {cost.type} {cost.description && `- ${cost.description}`}
                  </span>
                  <span className="text-gray-900">${Number(cost.value).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accept Button / Form */}
        {!isAccepted && !showAcceptForm && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <button
              onClick={() => setShowAcceptForm(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Accept This Budget
            </button>
          </div>
        )}

        {showAcceptForm && !isAccepted && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Accept Budget</h2>
            <form onSubmit={handleAccept} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.prospectName}
                  onChange={(e) => setFormData({ ...formData, prospectName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.prospectEmail}
                  onChange={(e) => setFormData({ ...formData, prospectEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.prospectPhone}
                  onChange={(e) => setFormData({ ...formData, prospectPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.prospectAddress}
                  onChange={(e) => setFormData({ ...formData, prospectAddress: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID</label>
                <input
                  type="text"
                  value={formData.prospectTaxId}
                  onChange={(e) => setFormData({ ...formData, prospectTaxId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={accepting}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50"
                >
                  {accepting ? 'Accepting...' : 'Confirm Acceptance'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAcceptForm(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {isAccepted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <svg className="w-16 h-16 text-green-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold text-green-900 mb-2">Budget Accepted!</h3>
            <p className="text-green-700">The manufacturer has been notified and will contact you soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
