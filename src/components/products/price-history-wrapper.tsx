"use client";

import { PriceHistoryDisplay } from "./price-history-display";
import { useProductPriceHistory } from "@/hooks/use-product-price-history";

interface PriceHistoryWrapperProps {
  productId: string;
  currentMrp: number;
  currentSellingPrice: number;
}

export function PriceHistoryWrapper({ 
  productId, 
  currentMrp, 
  currentSellingPrice 
}: PriceHistoryWrapperProps) {
  const { data, loading, error } = useProductPriceHistory(productId);

  if (loading) {
    return (
      <div className="mt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 w-full bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-24 w-full bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-24 w-full bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-600">
          Unable to load price history. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <PriceHistoryDisplay
      productId={productId}
      currentMrp={currentMrp}
      currentSellingPrice={currentSellingPrice}
      priceHistory={data?.priceHistory || []}
    />
  );
} 