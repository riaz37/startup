"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface GroupOrder {
  id: string;
  batchNumber: string;
  minThreshold: number;
  currentAmount: number;
  targetQuantity: number;
  currentQuantity: number;
  pricePerUnit: number;
  status: string;
  expiresAt: string;
  estimatedDelivery: string | null;
  product: {
    id: string;
    name: string;
    unit: string;
    unitSize: number;
    imageUrl: string | null;
    description: string | null;
    minOrderQty: number;
    maxOrderQty: number | null;
    category: {
      name: string;
    };
  };
}

interface Address {
  id: string;
  type: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  pincode: string;
  landmark: string | null;
  isDefault: boolean;
}

export default function JoinGroupOrderPage({
  params
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [groupOrder, setGroupOrder] = useState<GroupOrder | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    type: "HOME"
  });

  useEffect(() => {
    fetchGroupOrder();
    fetchAddresses();
  }, [params.id]);

  const fetchGroupOrder = async () => {
    try {
      const response = await fetch(`/api/group-orders/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setGroupOrder(data);
        setQuantity(data.product.minOrderQty);
      }
    } catch (error) {
      console.error("Error fetching group order:", error);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/addresses");
      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses);
        const defaultAddress = data.addresses.find((addr: Address) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        } else if (data.addresses.length > 0) {
          setSelectedAddressId(data.addresses[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newAddress)
      });

      if (response.ok) {
        const address = await response.json();
        setAddresses(prev => [address, ...prev]);
        setSelectedAddressId(address.id);
        setShowAddressForm(false);
        setNewAddress({
          name: "",
          phone: "",
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          pincode: "",
          landmark: "",
          type: "HOME"
        });
      } else {
        const result = await response.json();
        setError(result.error || "Failed to add address");
      }
    } catch (error) {
      setError("Failed to add address");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinOrder = async () => {
    if (!selectedAddressId) {
      setError("Please select a delivery address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/group-orders/${params.id}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          quantity,
          addressId: selectedAddressId
        })
      });

      const result = await response.json();

      if (response.ok) {
        // Redirect to order confirmation
        router.push(`/orders/confirmation?orderId=${result.order.id}`);
      } else {
        setError(result.error || "Failed to join group order");
      }
    } catch (error) {
      setError("Failed to join group order");
    } finally {
      setIsLoading(false);
    }
  };

  if (!groupOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading group order...</p>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const totalAmount = quantity * groupOrder.pricePerUnit;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Your App
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Join Group Order</h1>
            <p className="mt-2 text-sm text-gray-600">
              Complete your order for #{groupOrder.batchNumber}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Details */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Product Details</h2>
              
              <div className="flex items-start space-x-4">
                {groupOrder.product.imageUrl ? (
                  <img
                    src={groupOrder.product.imageUrl}
                    alt={groupOrder.product.name}
                    className="h-20 w-20 object-cover rounded-lg"
                  />
                ) : (
                  <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="h-10 w-10 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {groupOrder.product.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {groupOrder.product.unitSize} {groupOrder.product.unit} per unit
                  </p>
                  <p className="text-lg font-bold text-indigo-600 mt-2">
                    {formatPrice(groupOrder.pricePerUnit)} per {groupOrder.product.unit}
                  </p>
                </div>
              </div>

              {/* Quantity Selection */}
              <div className="mt-6">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Quantity ({groupOrder.product.unit})
                </label>
                <div className="mt-1 flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(groupOrder.product.minOrderQty, quantity - 1))}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-3 rounded"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || groupOrder.product.minOrderQty;
                      setQuantity(Math.max(groupOrder.product.minOrderQty, val));
                    }}
                    min={groupOrder.product.minOrderQty}
                    max={groupOrder.product.maxOrderQty || undefined}
                    className="block w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-center"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newQty = quantity + 1;
                      if (!groupOrder.product.maxOrderQty || newQty <= groupOrder.product.maxOrderQty) {
                        setQuantity(newQty);
                      }
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-3 rounded"
                  >
                    +
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Min: {groupOrder.product.minOrderQty} {groupOrder.product.unit}
                  {groupOrder.product.maxOrderQty && (
                    <span> • Max: {groupOrder.product.maxOrderQty} {groupOrder.product.unit}</span>
                  )}
                </p>
              </div>

              {/* Order Summary */}
              <div className="mt-6 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Unit Price:</span>
                  <span>{formatPrice(groupOrder.pricePerUnit)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span>Quantity:</span>
                  <span>{quantity} {groupOrder.product.unit}</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t">
                  <span>Total:</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Delivery Address</h2>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                >
                  Add New Address
                </button>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Address Selection */}
              {addresses.length > 0 && (
                <div className="space-y-3 mb-6">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`block p-4 border rounded-lg cursor-pointer ${
                        selectedAddressId === address.id
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddressId === address.id}
                        onChange={(e) => setSelectedAddressId(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{address.name}</span>
                            <span className="text-sm text-gray-500">({address.type})</span>
                            {address.isDefault && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {address.addressLine1}
                            {address.addressLine2 && `, ${address.addressLine2}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                          <p className="text-sm text-gray-600">Phone: {address.phone}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Add Address Form */}
              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="space-y-4 border-t pt-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        required
                        value={newAddress.name}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="tel"
                        required
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                    <input
                      type="text"
                      required
                      value={newAddress.addressLine1}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, addressLine1: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      <input
                        type="text"
                        required
                        value={newAddress.city}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">State</label>
                      <input
                        type="text"
                        required
                        value={newAddress.state}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pincode</label>
                    <input
                      type="text"
                      required
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, pincode: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      Add Address
                    </button>
                  </div>
                </form>
              )}

              {/* Place Order Button */}
              <div className="mt-6">
                <button
                  onClick={handleJoinOrder}
                  disabled={isLoading || !selectedAddressId}
                  className="w-full bg-indigo-600 border border-transparent rounded-md py-3 px-4 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    `Join Order - ${formatPrice(totalAmount)}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}