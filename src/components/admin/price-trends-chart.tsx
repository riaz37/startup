"use client";

import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, DollarSign, BarChart3, PieChart as PieChartIcon } from "lucide-react";

interface PriceHistoryData {
  id: string;
  mrp: number;
  sellingPrice: number;
  changeReason: string;
  admin: { name: string; email: string } | null;
  createdAt: string;
}

interface PriceTrends {
  trend: 'rising' | 'falling' | 'stable';
  changePercentage: number;
  volatility: number;
}

interface PriceTrendsChartProps {
  priceHistory: PriceHistoryData[];
  priceTrends: PriceTrends | null;
  selectedProduct: string;
}

const COLORS = {
  mrp: '#ef4444',      // Red for MRP
  sellingPrice: '#10b981', // Green for selling price
  increase: '#dc2626',  // Red for price increase
  decrease: '#059669',  // Green for price decrease
  stable: '#6b7280'     // Gray for stable
};

export function PriceTrendsChart({ priceHistory, priceTrends, selectedProduct }: PriceTrendsChartProps) {
  if (!selectedProduct || priceHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Price Trends Visualization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Select a product to view price trends
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for charts
  const chartData = priceHistory
    .slice()
    .reverse() // Reverse to show chronological order
    .map((record, index) => ({
      date: new Date(record.createdAt).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      mrp: Number(record.mrp),
      sellingPrice: Number(record.sellingPrice),
      changeReason: record.changeReason,
      admin: record.admin?.name || 'System',
      index
    }));

  // Calculate price change statistics
  const priceChanges = chartData.map((item, index) => {
    if (index === 0) return { change: 0, percentage: 0 };
    const prevPrice = chartData[index - 1].sellingPrice;
    const currentPrice = item.sellingPrice;
    const change = currentPrice - prevPrice;
    const percentage = prevPrice > 0 ? (change / prevPrice) * 100 : 0;
    return { change, percentage };
  });

  // Prepare data for price change distribution
  const changeDistribution = priceChanges.reduce((acc, item) => {
    if (item.percentage > 5) acc.increase++;
    else if (item.percentage < -5) acc.decrease++;
    else acc.stable++;
    return acc;
  }, { increase: 0, decrease: 0, stable: 0 });

  const pieChartData = [
    { name: 'Increase (>5%)', value: changeDistribution.increase, color: COLORS.increase },
    { name: 'Decrease (>5%)', value: changeDistribution.decrease, color: COLORS.decrease },
    { name: 'Stable (±5%)', value: changeDistribution.stable, color: COLORS.stable }
  ].filter(item => item.value > 0);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'falling': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'rising': return 'text-red-600';
      case 'falling': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: ₹{entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Price Trend</CardTitle>
            {priceTrends && getTrendIcon(priceTrends.trend)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${priceTrends ? getTrendColor(priceTrends.trend) : 'text-gray-600'}`}>
              {priceTrends ? priceTrends.trend.charAt(0).toUpperCase() + priceTrends.trend.slice(1) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {priceTrends ? `${priceTrends.changePercentage.toFixed(2)}% change` : 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volatility</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {priceTrends ? `${priceTrends.volatility.toFixed(2)}%` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Price fluctuation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Points</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{priceHistory.length}</div>
            <p className="text-xs text-muted-foreground">
              Price records
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Price Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Price Trends Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="mrp" 
                stroke={COLORS.mrp} 
                strokeWidth={3}
                name="MRP"
                dot={{ fill: COLORS.mrp, strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="sellingPrice" 
                stroke={COLORS.sellingPrice} 
                strokeWidth={3}
                name="Selling Price"
                dot={{ fill: COLORS.sellingPrice, strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Price Change Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Price Change Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priceChanges.slice(1)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" tick={{ fontSize: 12 }} />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                />
                <Tooltip 
                  formatter={(value: any) => [`${value.toFixed(2)}%`, 'Change']}
                  labelFormatter={(label) => `Update ${label}`}
                />
                <Bar 
                  dataKey="percentage" 
                  fill={COLORS.sellingPrice}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Change Pattern Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Price Change Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Price Change Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {priceChanges.slice(1).map((change, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge 
                    variant={change.percentage > 5 ? 'destructive' : change.percentage < -5 ? 'default' : 'secondary'}
                  >
                    {change.percentage > 0 ? '+' : ''}{change.percentage.toFixed(2)}%
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Update {index + 1} - {chartData[index + 1]?.changeReason}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {chartData[index + 1]?.admin} • {chartData[index + 1]?.date}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 