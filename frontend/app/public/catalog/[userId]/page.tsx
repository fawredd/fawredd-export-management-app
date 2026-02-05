'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';


interface Product {
  id: string;
  sku: string;
  title: string;
  description: string | null;
  imageUrls: string[];
  weightKg: number | null;
  volumeM3: number | null;
  tariffPosition: { code: string; description: string } | null;
  unit: { name: string; abbreviation: string } | null;
  provider: { name: string } | null;
  priceHistory: Array<{ value: number }>;
}

interface CatalogData {
  user: {
    id: string;
    name: string;
    role: string;
  };
  products: Product[];
  total: number;
}

export default function PublicCatalogPage() {
  const params = useParams();
  const userId = params.userId as string;
  const [data, setData] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(`${apiUrl}/api/public/catalog/${userId}`);

        if (!response.ok) {
          throw new Error('Catalog not found');
        }

        const catalogData = await response.json();
        setData(catalogData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load catalog');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchCatalog();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading catalog...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Catalog Not Found</h1>
          <p className="text-gray-600">{error || 'This catalog does not exist or is not public.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">{data.user.name}</h1>
          <p className="text-gray-600 mt-1">Product Catalog</p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8">
        {data.products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products available in this catalog yet.</p>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">{data.total} products available</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-100 relative">
                    {product.imageUrls && product.imageUrls.length > 0 ? (
                      <Image
                        src={product.imageUrls[0]}
                        alt={product.title}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">{product.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">SKU: {product.sku}</p>

                    {product.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                    )}

                    {/* Specifications */}
                    <div className="space-y-1 text-sm">
                      {product.unit && (
                        <p className="text-gray-600">
                          <span className="font-medium">Unit:</span> {product.unit.name}
                        </p>
                      )}
                      {product.weightKg && (
                        <p className="text-gray-600">
                          <span className="font-medium">Weight:</span> {product.weightKg} kg
                        </p>
                      )}
                      {product.priceHistory && product.priceHistory.length > 0 && (
                        <p className="text-blue-600 font-semibold mt-2">
                          ${Number(product.priceHistory[0].value).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          <p>Powered by Export Management System</p>
        </div>
      </div>
    </div>
  );
}
