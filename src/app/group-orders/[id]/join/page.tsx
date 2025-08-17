"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, Plus, MapPin, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [groupOrder, setGroupOrder] = useState<GroupOrder | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
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
    const fetchData = async () => {
      const { id } = await params;
      await fetchGroupOrder(id);
      await fetchAddresses();
    };
    fetchData();
  }, [params]);

  // Ensure quantity is always valid
  useEffect(() => {
    if (groupOrder && (!quantity || quantity < (groupOrder.product.minOrderQty || 1))) {
      setQuantity(groupOrder.product.minOrderQty || 1);
    }
  }, [groupOrder, quantity]);

  const fetchGroupOrder = async (id: string) => {
    try {
      const response = await fetch(`/api/group-orders/${id}`);
      if (response.ok) {
        const data = await response.json();
        setGroupOrder(data);
        setQuantity(data.product.minOrderQty || 1);
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
      const { id } = await params;
      const response = await fetch(`/api/group-orders/${id}/join`, {
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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading group order...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const totalAmount = (quantity || 0) * (groupOrder.pricePerUnit || 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            href={`/group-orders/${groupOrder.id}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Group Order
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Badge variant="secondary" className="text-sm">
              #{groupOrder.batchNumber}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Join <span className="text-primary">Group Order</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete your order for {groupOrder.product.name} at bulk pricing
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Product Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-4">
                {groupOrder.product.imageUrl ? (
                  <img
                    src={groupOrder.product.imageUrl}
                    alt={groupOrder.product.name}
                    className="h-20 w-20 object-cover rounded-lg border"
                  />
                ) : (
                  <div className="h-20 w-20 bg-muted rounded-lg flex items-center justify-center border">
                    <Package className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-foreground">
                    {groupOrder.product.name}
                  </h3>
                  <Badge variant="secondary" className="mt-1">
                    {groupOrder.product.category.name}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    {groupOrder.product.unitSize} {groupOrder.product.unit} per unit
                  </p>
                  <p className="text-lg font-bold text-primary mt-2">
                    {formatPrice(groupOrder.pricePerUnit)} per {groupOrder.product.unit}
                  </p>
                </div>
              </div>

              {/* Quantity Selection */}
              <div className="space-y-3">
                <Label htmlFor="quantity">
                  Quantity ({groupOrder.product.unit})
                </Label>
                <div className="flex items-center space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(groupOrder.product.minOrderQty || 1, (quantity || 1) - 1))}
                    className="h-10 w-10 p-0"
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    id="quantity"
                    value={quantity || ""}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || groupOrder.product.minOrderQty || 1;
                      setQuantity(Math.max(groupOrder.product.minOrderQty || 1, val));
                    }}
                    min={groupOrder.product.minOrderQty}
                    max={groupOrder.product.maxOrderQty || undefined}
                    className="w-20 text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newQty = (quantity || 1) + 1;
                      if (!groupOrder.product.maxOrderQty || newQty <= groupOrder.product.maxOrderQty) {
                        setQuantity(newQty);
                      }
                    }}
                    className="h-10 w-10 p-0"
                  >
                    +
                  </Button>
                </div>
                                  <p className="text-sm text-muted-foreground">
                    Min: {groupOrder.product.minOrderQty || 1} {groupOrder.product.unit}
                    {groupOrder.product.maxOrderQty && (
                      <span> • Max: {groupOrder.product.maxOrderQty} {groupOrder.product.unit}</span>
                    )}
                  </p>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Unit Price:</span>
                  <span className="font-medium">{formatPrice(groupOrder.pricePerUnit)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-medium">{quantity || 0} {groupOrder.product.unit}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t">
                  <span>Total:</span>
                  <span className="text-primary">{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Delivery Address
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Address
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Address Selection */}
              {addresses.length > 0 && (
                <RadioGroup
                  value={selectedAddressId}
                  onValueChange={setSelectedAddressId}
                  className="space-y-3"
                >
                  {addresses.map((address) => (
                    <div key={address.id} className="flex items-start space-x-3">
                      <RadioGroupItem value={address.id} id={address.id} />
                      <Label
                        htmlFor={address.id}
                        className="flex-1 cursor-pointer"
                      >
                        <div className={`p-4 border rounded-lg transition-colors ${
                          selectedAddressId === address.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-border/80"
                        }`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-foreground">{address.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {address.type}
                                </Badge>
                                {address.isDefault && (
                                  <Badge variant="secondary" className="text-xs">
                                    Default
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {address.addressLine1}
                                {address.addressLine2 && `, ${address.addressLine2}`}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {address.city}, {address.state} - {address.pincode}
                              </p>
                              <p className="text-sm text-muted-foreground">Phone: {address.phone}</p>
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {/* Add Address Form */}
              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="space-y-4 border-t pt-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        type="text"
                        required
                        value={newAddress.name}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="addressLine1">Address Line 1</Label>
                    <Input
                      id="addressLine1"
                      type="text"
                      required
                      value={newAddress.addressLine1}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, addressLine1: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        type="text"
                        required
                        value={newAddress.city}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        type="text"
                        required
                        value={newAddress.state}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      type="text"
                      required
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, pincode: e.target.value }))}
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddressForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? "Adding..." : "Add Address"}
                    </Button>
                  </div>
                </form>
              )}

              {/* Place Order Button */}
              <div className="pt-4 border-t">
                <Button
                  onClick={handleJoinOrder}
                  disabled={isLoading || !selectedAddressId}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Join Order - {formatPrice(totalAmount)}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}