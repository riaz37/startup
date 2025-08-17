import { useState, useEffect } from 'react';
import { DiscountConfig, CreateDiscountConfigData, UpdateDiscountConfigData } from '@/lib/services/discount-service';

export function useDiscounts() {
  const [discounts, setDiscounts] = useState<DiscountConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDiscounts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/discounts');
      if (!response.ok) {
        throw new Error('Failed to fetch discounts');
      }
      const data = await response.json();
      setDiscounts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const createDiscount = async (discountData: CreateDiscountConfigData): Promise<DiscountConfig | null> => {
    try {
      const response = await fetch('/api/admin/discounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(discountData),
      });

      if (!response.ok) {
        throw new Error('Failed to create discount');
      }

      const newDiscount = await response.json();
      setDiscounts(prev => [newDiscount, ...prev]);
      return newDiscount;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create discount');
      return null;
    }
  };

  const updateDiscount = async (id: string, discountData: UpdateDiscountConfigData): Promise<DiscountConfig | null> => {
    try {
      const response = await fetch(`/api/admin/discounts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(discountData),
      });

      if (!response.ok) {
        throw new Error('Failed to update discount');
      }

      const updatedDiscount = await response.json();
      setDiscounts(prev => prev.map(d => d.id === id ? updatedDiscount : d));
      return updatedDiscount;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update discount');
      return null;
    }
  };

  const deleteDiscount = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/admin/discounts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete discount');
      }

      setDiscounts(prev => prev.filter(d => d.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete discount');
      return false;
    }
  };

  const toggleDiscountStatus = async (id: string, isActive: boolean): Promise<boolean> => {
    return await updateDiscount(id, { isActive }) !== null;
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  return {
    discounts,
    isLoading,
    error,
    fetchDiscounts,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    toggleDiscountStatus,
  };
} 