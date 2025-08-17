import { useState, useEffect } from 'react';

interface PriceHistoryRecord {
  id: string;
  mrp: number;
  sellingPrice: number;
  changeReason: string;
  createdAt: string;
}

interface PriceHistoryData {
  productId: string;
  productName: string;
  priceHistory: PriceHistoryRecord[];
  totalChanges: number;
}

interface UseProductPriceHistoryReturn {
  data: PriceHistoryData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProductPriceHistory(productId: string): UseProductPriceHistoryReturn {
  const [data, setData] = useState<PriceHistoryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPriceHistory = async () => {
    if (!productId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/products/${productId}/price-history`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch price history');
      }

      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch price history');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceHistory();
  }, [productId]);

  return {
    data,
    loading,
    error,
    refetch: fetchPriceHistory
  };
} 