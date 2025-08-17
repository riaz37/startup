"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bell, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  sellingPrice: number;
  imageUrl?: string;
}

interface PriceAlertSetupProps {
  products: Product[];
  userId: string;
}

export function PriceAlertSetup({ products, userId }: PriceAlertSetupProps) {
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [alertType, setAlertType] = useState<'PRICE_DROP' | 'PRICE_INCREASE' | 'ANY_CHANGE'>('PRICE_DROP');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const selectedProductData = products.find(p => p.id === selectedProduct);

  const handleCreateAlert = async () => {
    if (!selectedProduct || !targetPrice) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/price-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          productId: selectedProduct,
          targetPrice: parseFloat(targetPrice),
          alertType
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Price alert created successfully!' });
        setSelectedProduct('');
        setTargetPrice('');
        setAlertType('PRICE_DROP');
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to create price alert' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while creating the alert' });
    } finally {
      setLoading(false);
    }
  };

  const getAlertTypeDescription = (type: string) => {
    switch (type) {
      case 'PRICE_DROP':
        return 'Notify me when price drops below target';
      case 'PRICE_INCREASE':
        return 'Notify me when price increases above target';
      case 'ANY_CHANGE':
        return 'Notify me of any significant price change';
      default:
        return '';
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'PRICE_DROP':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'PRICE_INCREASE':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'ANY_CHANGE':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Set Price Alert
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="product-select">Select Product</Label>
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  <div className="flex items-center gap-2">
                    {product.imageUrl && (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-6 h-6 rounded object-cover"
                      />
                    )}
                    <span>{product.name}</span>
                    <Badge variant="outline" className="ml-auto">
                      ₹{product.sellingPrice.toFixed(2)}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedProductData && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{selectedProductData.name}</div>
                <div className="text-sm text-gray-600">Current Price</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  ₹{selectedProductData.sellingPrice.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">per unit</div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="alert-type">Alert Type</Label>
          <Select value={alertType} onValueChange={(value: 'PRICE_DROP' | 'PRICE_INCREASE' | 'ANY_CHANGE') => setAlertType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PRICE_DROP">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-green-500" />
                  Price Drop Alert
                </div>
              </SelectItem>
              <SelectItem value="PRICE_INCREASE">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  Price Increase Alert
                </div>
              </SelectItem>
              <SelectItem value="ANY_CHANGE">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Any Change Alert
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            {getAlertTypeDescription(alertType)}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="target-price">Target Price</Label>
          <Input
            id="target-price"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
          />
          <p className="text-xs text-gray-500">
            {alertType === 'PRICE_DROP' && 'You\'ll be notified when the price drops below this amount'}
            {alertType === 'PRICE_INCREASE' && 'You\'ll be notified when the price increases above this amount'}
            {alertType === 'ANY_CHANGE' && 'You\'ll be notified of any significant price change (5% or more)'}
          </p>
        </div>

        <Button 
          onClick={handleCreateAlert} 
          disabled={loading || !selectedProduct || !targetPrice}
          className="w-full"
        >
          {loading ? 'Creating...' : (
            <div className="flex items-center gap-2">
              {getAlertTypeIcon(alertType)}
              Create Price Alert
            </div>
          )}
        </Button>

        <div className="text-xs text-gray-500 text-center">
          You can manage your price alerts in your profile settings
        </div>
      </CardContent>
    </Card>
  );
} 