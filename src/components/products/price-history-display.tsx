"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Clock, 
  Eye,
  EyeOff,
  Calendar,
  DollarSign
} from "lucide-react";

interface PriceHistoryRecord {
  id: string;
  mrp: number;
  sellingPrice: number;
  changeReason: string;
  createdAt: string;
}

interface PriceHistoryDisplayProps {
  productId: string;
  currentMrp: number;
  currentSellingPrice: number;
  priceHistory: PriceHistoryRecord[];
}

export function PriceHistoryDisplay({ 
  productId, 
  currentMrp, 
  currentSellingPrice, 
  priceHistory 
}: PriceHistoryDisplayProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [showFullHistory, setShowFullHistory] = useState(false);

  // Calculate savings
  const savings = currentMrp - currentSellingPrice;
  const savingsPercentage = (savings / currentMrp) * 100;

  // Get price change from last record
  const getPriceChange = () => {
    if (priceHistory.length < 2) return null;
    
    const current = priceHistory[0]; // Most recent
    const previous = priceHistory[1]; // Previous
    
    const change = current.sellingPrice - previous.sellingPrice;
    const changePercentage = (change / previous.sellingPrice) * 100;
    
    return {
      change,
      changePercentage,
      isIncrease: change > 0,
      isDecrease: change < 0,
      isStable: Math.abs(changePercentage) < 2
    };
  };

  const priceChange = getPriceChange();

  // Get trend icon and color
  const getTrendIcon = () => {
    if (!priceChange) return <Minus className="h-4 w-4 text-gray-500" />;
    
    if (priceChange.isIncrease) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (priceChange.isDecrease) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = () => {
    if (!priceChange) return "text-gray-500";
    
    if (priceChange.isIncrease) return "text-red-500";
    if (priceChange.isDecrease) return "text-green-500";
    return "text-gray-500";
  };

  const getTrendText = () => {
    if (!priceChange) return "Price Stable";
    
    if (priceChange.isIncrease) return `Price Increased by ${priceChange.changePercentage.toFixed(1)}%`;
    if (priceChange.isDecrease) return `Price Decreased by ${Math.abs(priceChange.changePercentage).toFixed(1)}%`;
    return "Price Stable";
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Get limited history for display
  const displayHistory = showFullHistory ? priceHistory : priceHistory.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Current Price Display */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-primary">Current Pricing</h3>
              <p className="text-sm text-muted-foreground">Latest prices and savings</p>
            </div>
            {priceChange && (
              <div className="flex items-center space-x-2">
                {getTrendIcon()}
                <span className={`text-sm font-medium ${getTrendColor()}`}>
                  {getTrendText()}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* MRP */}
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-sm text-muted-foreground mb-1">MRP</div>
              <div className="text-lg font-bold text-gray-600 line-through">
                {formatPrice(currentMrp)}
              </div>
            </div>

            {/* Selling Price */}
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-sm text-muted-foreground mb-1">Your Price</div>
              <div className="text-2xl font-bold text-primary">
                {formatPrice(currentSellingPrice)}
              </div>
            </div>

            {/* Savings */}
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-sm text-muted-foreground mb-1">You Save</div>
              <div className="text-lg font-bold text-green-600">
                {formatPrice(savings)}
              </div>
              <div className="text-sm text-green-500">
                ({savingsPercentage.toFixed(0)}% off)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price History Toggle */}
      <div className="text-center">
        <Button
          variant="outline"
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center space-x-2"
        >
          {showHistory ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span>
            {showHistory ? "Hide" : "Show"} Price History
          </span>
        </Button>
      </div>

      {/* Price History */}
      {showHistory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Price History & Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Price Change Summary */}
              {priceChange && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium mb-1">Recent Price Change</h4>
                      <p className="text-sm text-muted-foreground">
                        {priceChange.isIncrease ? "Price went up" : priceChange.isDecrease ? "Price went down" : "Price remained stable"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getTrendColor()}`}>
                        {priceChange.isIncrease ? "+" : ""}{formatPrice(priceChange.change)}
                      </div>
                      <div className={`text-sm ${getTrendColor()}`}>
                        {priceChange.isIncrease ? "+" : ""}{priceChange.changePercentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Price Timeline */}
              <div className="space-y-3">
                <h4 className="font-medium">Price Timeline</h4>
                {displayHistory.map((record, index) => (
                  <div key={record.id} className="flex items-start space-x-3">
                    {/* Timeline Dot */}
                    <div className="relative">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-primary' : 'bg-gray-300'
                      }`}></div>
                      {index < displayHistory.length - 1 && (
                        <div className="absolute top-3 left-1.5 w-px h-8 bg-gray-300"></div>
                      )}
                    </div>

                    {/* Price Details */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {formatPrice(record.sellingPrice)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(record.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground line-through">
                            MRP: {formatPrice(record.mrp)}
                          </div>
                          {index === 0 && (
                            <Badge variant="secondary" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {record.changeReason && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Reason: {record.changeReason}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Show More/Less Button */}
              {priceHistory.length > 3 && (
                <div className="text-center pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFullHistory(!showFullHistory)}
                  >
                    {showFullHistory ? "Show Less" : `Show ${priceHistory.length - 3} More Changes`}
                  </Button>
                </div>
              )}

              {/* Transparency Note */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <DollarSign className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Price Transparency</p>
                    <p>We believe in transparent pricing. See how our prices have changed over time and understand the reasons behind any adjustments.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 