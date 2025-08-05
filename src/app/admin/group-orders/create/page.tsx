"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  unit: string;
  unitSize: number;
  sellingPrice: number;
}

export default function CreateGroupOrderPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    productId: "",
    minThreshold: "",
    targetQuantity: "",
    pricePerUnit: "",
    expiresAt: "",
    estimatedDelivery: ""
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setFormData(prev => ({
        ...prev,
        productId,
        pricePerUnit: (product.sellingPrice * 0.9).toString() // 10% bulk discount
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/group-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create group order");
      }

      router.push("/admin");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedProduct = products.find(p => p.id === formData.productId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/admin" className="text-xl font-bold text-gray-900">
                Admin Dashboard
              </Link>
              <div className="ml-10 space-x-8">
                <Link
                  href="/admin"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/group-orders/create"
                  className="text-indigo-600 hover:text-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Create Group Order
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create New Group Order</h1>
            <p className="mt-2 text-sm text-gray-600">
              Set up a new group order for bulk purchasing
            </p>
          </div>

          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Product Selection */}
              <div>
                <label htmlFor="productId" className="block text-sm font-medium text-gray-700">
                  Product
                </label>
                <select
                  id="productId"
                  value={formData.productId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.unitSize} {product.unit})
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Product Details</h3>
                  <div className="text-sm text-gray-600">
                    <p>Regular Price: ₹{selectedProduct.sellingPrice} per {selectedProduct.unit}</p>
                    <p>Unit Size: {selectedProduct.unitSize} {selectedProduct.unit}</p>
                  </div>
                </div>
              )}

              {/* Minimum Threshold */}
              <div>
                <label htmlFor="minThreshold" className="block text-sm font-medium text-gray-700">
                  Minimum Threshold Amount (₹)
                </label>
                <input
                  type="number"
                  id="minThreshold"
                  value={formData.minThreshold}
                  onChange={(e) => setFormData(prev => ({ ...prev, minThreshold: e.target.value }))}
                  required
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g., 5000"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Minimum total amount needed to proceed with the order
                </p>
              </div>

              {/* Target Quantity */}
              <div>
                <label htmlFor="targetQuantity" className="block text-sm font-medium text-gray-700">
                  Target Quantity
                </label>
                <input
                  type="number"
                  id="targetQuantity"
                  value={formData.targetQuantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetQuantity: e.target.value }))}
                  required
                  min="1"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g., 100"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Total quantity to order from supplier
                </p>
              </div>

              {/* Price Per Unit */}
              <div>
                <label htmlFor="pricePerUnit" className="block text-sm font-medium text-gray-700">
                  Bulk Price Per Unit (₹)
                </label>
                <input
                  type="number"
                  id="pricePerUnit"
                  value={formData.pricePerUnit}
                  onChange={(e) => setFormData(prev => ({ ...prev, pricePerUnit: e.target.value }))}
                  required
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Discounted price for bulk purchase
                </p>
              </div>

              {/* Expires At */}
              <div>
                <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700">
                  Order Expires On
                </label>
                <input
                  type="datetime-local"
                  id="expiresAt"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                  required
                  min={new Date().toISOString().slice(0, 16)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <p className="mt-1 text-sm text-gray-500">
                  When to stop accepting orders
                </p>
              </div>

              {/* Estimated Delivery */}
              <div>
                <label htmlFor="estimatedDelivery" className="block text-sm font-medium text-gray-700">
                  Estimated Delivery Date (Optional)
                </label>
                <input
                  type="date"
                  id="estimatedDelivery"
                  value={formData.estimatedDelivery}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Expected delivery date for customers
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <Link
                  href="/admin"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Creating..." : "Create Group Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}