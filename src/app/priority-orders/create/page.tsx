"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Package, 
  MapPin, 
  Truck, 
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Banknote
} from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  description?: string;
  unit: string;
  unitSize: number;
  mrp: number;
  minOrderQty: number;
  maxOrderQty?: number;
  imageUrl?: string;
  category: {
    name: string;
  };
}

interface Address {
  id: string;
  type: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

enum PaymentMethod {
  CARD = "CARD",
  UPI = "UPI",
  NETBANKING = "NETBANKING",
  WALLET = "WALLET",
  CASH_ON_DELIVERY = "CASH_ON_DELIVERY"
}

enum DeliveryType {
  HOME_DELIVERY = "HOME_DELIVERY",
  PICKUP = "PICKUP"
}

export default function CreatePriorityOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");

  const [product, setProduct] = useState<Product | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [selectedDeliveryType, setSelectedDeliveryType] = useState<DeliveryType>(DeliveryType.HOME_DELIVERY);
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchAddresses();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data.product);
        setQuantity(data.product.minOrderQty);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to load product information');
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/addresses');
      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses);
        if (data.addresses.length > 0) {
          setSelectedAddressId(data.addresses[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setError('Failed to load addresses');
    }
  };

  const handleCreateOrder = async () => {
    if (!product || !selectedAddressId || !selectedPaymentMethod) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/priority-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          addressId: selectedAddressId,
          deliveryType: selectedDeliveryType,
          notes,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/priority-orders/${data.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create priority order');
      }
    } catch (error) {
      console.error('Error creating priority order:', error);
      setError('Failed to create priority order');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const totalAmount = product ? quantity * product.mrp : 0;

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading product information...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link 
            href={`/products/${product.id}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Product
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Priority Order</h1>
          <p className="text-muted-foreground">
            Place a priority order for faster delivery at MRP price
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Product Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-4">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {product.unitSize} {product.unit} • {product.category.name}
                    </p>
                    {product.description && (
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span className="font-medium text-amber-800">Priority Order Pricing</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-amber-700">Unit Price (MRP):</span>
                      <span className="font-semibold text-amber-800">{formatPrice(product.mrp)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-amber-700">Quantity:</span>
                      <span className="font-semibold text-amber-800">{quantity}</span>
                    </div>
                    <div className="border-t border-amber-200 pt-2">
                      <div className="flex justify-between">
                        <span className="font-medium text-amber-800">Total Amount:</span>
                        <span className="text-lg font-bold text-amber-800">{formatPrice(totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quantity Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Quantity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="quantity">Quantity ({product.unit})</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min={product.minOrderQty}
                      max={product.maxOrderQty || 999}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || product.minOrderQty)}
                      className="mt-2"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Min: {product.minOrderQty} {product.unit}
                      {product.maxOrderQty && ` • Max: ${product.maxOrderQty} ${product.unit}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Configuration */}
          <div className="space-y-6">
            {/* Delivery Type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Delivery Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedDeliveryType}
                  onValueChange={(value) => setSelectedDeliveryType(value as DeliveryType)}
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <RadioGroupItem value={DeliveryType.HOME_DELIVERY} id="home-delivery" />
                    <Label htmlFor="home-delivery" className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>Home Delivery</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={DeliveryType.PICKUP} id="pickup" />
                    <Label htmlFor="pickup" className="flex items-center space-x-2">
                      <Package className="h-4 w-4" />
                      <span>Pickup from Location</span>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Address Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                {addresses.length === 0 ? (
                  <div className="text-center py-6">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No addresses found</p>
                    <Button variant="outline" asChild>
                      <Link href="/dashboard/addresses">Add Address</Link>
                    </Button>
                  </div>
                ) : (
                  <RadioGroup
                    value={selectedAddressId}
                    onValueChange={setSelectedAddressId}
                  >
                    {addresses.map((address) => (
                      <div key={address.id} className="flex items-center space-x-2 mb-3">
                        <RadioGroupItem value={address.id} id={address.id} />
                        <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                          <div className="p-3 border rounded-lg hover:bg-muted/50">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium capitalize">{address.type}</span>
                              <span className="text-sm text-muted-foreground">{address.pincode}</span>
                            </div>
                            <p className="text-sm">{address.street}</p>
                            <p className="text-sm text-muted-foreground">
                              {address.city}, {address.state}, {address.country}
                            </p>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Banknote className="h-5 w-5 mr-2" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedPaymentMethod || ""}
                  onValueChange={(value) => setSelectedPaymentMethod(value as PaymentMethod)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={PaymentMethod.CARD} id="card" />
                      <Label htmlFor="card">Credit/Debit Card</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={PaymentMethod.UPI} id="upi" />
                      <Label htmlFor="upi">UPI</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={PaymentMethod.NETBANKING} id="netbanking" />
                      <Label htmlFor="netbanking">Net Banking</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={PaymentMethod.WALLET} id="wallet" />
                      <Label htmlFor="wallet">Digital Wallet</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={PaymentMethod.CASH_ON_DELIVERY} id="cod" />
                      <Label htmlFor="cod">Cash on Delivery</Label>
                    </div>
                  </div>
                </RadioGroup>

                {/* Cash on Delivery Notice */}
                {selectedPaymentMethod === PaymentMethod.CASH_ON_DELIVERY && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Banknote className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div className="text-sm text-amber-700">
                        <p className="font-medium mb-1">Cash on Delivery Information</p>
                        <p>• Payment will be collected when your order is delivered</p>
                        <p>• Please have the exact amount ready</p>
                        <p>• No additional charges for cash on delivery</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Any special instructions or notes for your order..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Place Order Button */}
            <div className="pt-4">
              <Button
                onClick={handleCreateOrder}
                disabled={isLoading || !selectedAddressId || !selectedPaymentMethod}
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
                    {selectedPaymentMethod === PaymentMethod.CASH_ON_DELIVERY 
                      ? `Confirm COD Order - ${formatPrice(totalAmount)}`
                      : `Place Priority Order - ${formatPrice(totalAmount)}`
                    }
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 