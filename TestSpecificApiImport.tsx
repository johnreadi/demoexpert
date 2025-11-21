import React, { useEffect, useState } from 'react';
import { getProducts } from './api';

export default function TestSpecificApiImport(): React.ReactNode {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testApi = async () => {
      try {
        // Test a simple API call
        const result = await getProducts({ limit: 3 });
        setProducts(result);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch products: ' + (err as Error).message);
        setLoading(false);
      }
    };

    testApi();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Test Specific API Import</h1>
      <p>Successfully fetched {products.length} products.</p>
      <ul>
        {products.map((product, index) => (
          <li key={index}>{product.name || 'Unnamed product'}</li>
        ))}
      </ul>
    </div>
  );
}