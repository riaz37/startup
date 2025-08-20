"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClientPageLayout } from "@/components/layout/client-page-layout";
import { PageHeader, MainContainer } from "@/components/layout";
import { SohozdaamCard, SohozdaamCardHeader, SohozdaamCardTitle, SohozdaamCardContent } from "@/components/ui/sohozdaam-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  MapPin, 
  Truck, 
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Banknote,
  Zap,
  Shield,
  Star
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
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  name: string;
  phone: string;
  landmark?: string;
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
        setProduct(data);
        setQuantity(data.minOrderQty);
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
      <ClientPageLayout>
        <MainContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-6"></div>
              <p className="text-muted-foreground text-lg">Loading product information...</p>
            </div>
          </div>
        </MainContainer>
      </ClientPageLayout>
    );
  }

  return (
    <ClientPageLayout>
      <MainContainer>
        {/* Back Navigation */}
        <div className="mb-8">
          <Link 
            href={`/products/${product.id}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Product
          </Link>
        </div>

        {/* Header */}
        <PageHeader
          badge="⚡ Priority Order"
          title="Fast Track Your Order"
          highlightedWord="Fast Track"
          description="Skip the wait and get your product delivered faster with our priority ordering system. Pay MRP price for immediate processing and expedited delivery."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Product Information */}
          <div className="space-y-6">
            {/* Product Details Card */}
            <SohozdaamCard variant="product" hover>
              <SohozdaamCardHeader>
                <div className="flex items-center justify-between">
                  <SohozdaamCardTitle className="flex items-center">
                    <Package className="h-6 w-6 mr-3 text-primary" />
                    Product Details
                  </SohozdaamCardTitle>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {product.category.name}
                  </Badge>
                </div>
              </SohozdaamCardHeader>
              <SohozdaamCardContent>
                <div className="flex items-start space-x-4 mb-6">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-28 h-28 object-cover rounded-xl border border-border/50"
                    />
                  ) : (
                    <div className="w-28 h-28 bg-gradient-to-br from-muted to-muted/50 rounded-xl flex items-center justify-center border border-border/50">
                      <Package className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-xl mb-2 text-foreground">{product.name}</h3>
                    <div className="flex items-center space-x-4 mb-3">
                      <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">
                        {product.unitSize} {product.unit}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Star className="h-4 w-4 mr-1 text-amber-500 fill-amber-500" />
                        <span>Premium Quality</span>
                      </div>
                    </div>
                    {product.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                    )}
                  </div>
                </div>

                {/* Priority Order Pricing Highlight */}
                <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Zap className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-800">Priority Order Pricing</h4>
                      <p className="text-sm text-amber-700">MRP Price • Fast Delivery</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-amber-700">Unit Price (MRP):</span>
                      <span className="font-bold text-lg text-amber-800">{formatPrice(product.mrp)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-amber-700">Quantity:</span>
                      <span className="font-semibold text-amber-800">{quantity}</span>
                    </div>
                    <div className="border-t border-amber-200/50 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-amber-800">Total Amount:</span>
                        <span className="text-2xl font-bold text-amber-800">{formatPrice(totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </SohozdaamCardContent>
            </SohozdaamCard>

            {/* Quantity Selection Card */}
            <SohozdaamCard>
              <SohozdaamCardHeader>
                <SohozdaamCardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2 text-primary" />
                  Quantity Selection
                </SohozdaamCardTitle>
              </SohozdaamCardHeader>
              <SohozdaamCardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="quantity" className="text-sm font-medium text-foreground">
                      Quantity ({product.unit})
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min={product.minOrderQty}
                      max={product.maxOrderQty || 999}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || product.minOrderQty)}
                      className="mt-2 text-lg"
                    />
                    <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                      <span>Min: {product.minOrderQty} {product.unit}</span>
                      {product.maxOrderQty && (
                        <span>Max: {product.maxOrderQty} {product.unit}</span>
                      )}
                    </div>
                  </div>
                </div>
              </SohozdaamCardContent>
            </SohozdaamCard>
          </div>

          {/* Right Column - Order Configuration */}
          <div className="space-y-6">
            {/* Delivery Method Card */}
            <SohozdaamCard>
              <SohozdaamCardHeader>
                <SohozdaamCardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2 text-primary" />
                  Delivery Method
                </SohozdaamCardTitle>
              </SohozdaamCardHeader>
              <SohozdaamCardContent>
                <RadioGroup
                  value={selectedDeliveryType}
                  onValueChange={(value) => setSelectedDeliveryType(value as DeliveryType)}
                >
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                      <RadioGroupItem value={DeliveryType.HOME_DELIVERY} id="home-delivery" />
                      <Label htmlFor="home-delivery" className="flex items-center space-x-3 cursor-pointer flex-1">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium">Home Delivery</span>
                          <p className="text-sm text-muted-foreground">Delivered to your doorstep</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                      <RadioGroupItem value={DeliveryType.PICKUP} id="pickup" />
                      <Label htmlFor="pickup" className="flex items-center space-x-3 cursor-pointer flex-1">
                        <div className="p-2 bg-secondary/10 rounded-lg">
                          <Package className="h-5 w-5 text-secondary" />
                        </div>
                        <div>
                          <span className="font-medium">Pickup from Location</span>
                          <p className="text-sm text-muted-foreground">Collect from our pickup center</p>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </SohozdaamCardContent>
            </SohozdaamCard>

            {/* Delivery Address Card */}
            <SohozdaamCard>
              <SohozdaamCardHeader>
                <SohozdaamCardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  Delivery Address
                </SohozdaamCardTitle>
              </SohozdaamCardHeader>
              <SohozdaamCardContent>
                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="p-4 bg-muted/30 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <MapPin className="h-10 w-10 text-muted-foreground" />
                    </div>
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
                    <div className="space-y-3">
                      {addresses.map((address) => (
                        <div key={address.id} className="flex items-start space-x-3">
                          <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                          <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                            <div className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline" className="capitalize">
                                  {address.type}
                                </Badge>
                                <span className="text-sm text-muted-foreground font-mono">{address.pincode}</span>
                              </div>
                              <p className="font-medium text-foreground mb-1">{address.addressLine1}</p>
                              <p className="text-sm text-muted-foreground mb-2">
                                {address.addressLine2 && `${address.addressLine2}, `}
                                {address.city}, {address.state}
                              </p>
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>📞 {address.phone}</span>
                                <span>👤 {address.name}</span>
                              </div>
                              {address.landmark && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  🏷️ Landmark: {address.landmark}
                                </p>
                              )}
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}
              </SohozdaamCardContent>
            </SohozdaamCard>

            {/* Payment Method Card */}
            <SohozdaamCard>
              <SohozdaamCardHeader>
                <SohozdaamCardTitle className="flex items-center">
                  <Banknote className="h-5 w-5 mr-2 text-primary" />
                  Payment Method
                </SohozdaamCardTitle>
              </SohozdaamCardHeader>
              <SohozdaamCardContent>
                <RadioGroup
                  value={selectedPaymentMethod || ""}
                  onValueChange={(value) => setSelectedPaymentMethod(value as PaymentMethod)}
                >
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                        <RadioGroupItem value={PaymentMethod.CARD} id="card" />
                        <Label htmlFor="card" className="cursor-pointer">💳 Credit/Debit Card</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                        <RadioGroupItem value={PaymentMethod.UPI} id="upi" />
                        <Label htmlFor="upi" className="cursor-pointer">📱 UPI</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                        <RadioGroupItem value={PaymentMethod.NETBANKING} id="netbanking" />
                        <Label htmlFor="netbanking" className="cursor-pointer">🏦 Net Banking</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                        <RadioGroupItem value={PaymentMethod.WALLET} id="wallet" />
                        <Label htmlFor="wallet" className="cursor-pointer">👛 Digital Wallet</Label>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                      <RadioGroupItem value={PaymentMethod.CASH_ON_DELIVERY} id="cod" />
                      <Label htmlFor="cod" className="cursor-pointer">💵 Cash on Delivery</Label>
                    </div>
                  </div>
                </RadioGroup>

                {/* Cash on Delivery Notice */}
                {selectedPaymentMethod === PaymentMethod.CASH_ON_DELIVERY && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <Shield className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="text-sm text-amber-700">
                        <p className="font-medium mb-2">Cash on Delivery Information</p>
                        <ul className="space-y-1">
                          <li>• Payment collected upon delivery</li>
                          <li>• Please have exact amount ready</li>
                          <li>• No additional charges for COD</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </SohozdaamCardContent>
            </SohozdaamCard>

            {/* Additional Notes Card */}
            <SohozdaamCard>
              <SohozdaamCardHeader>
                <SohozdaamCardTitle>Additional Notes</SohozdaamCardTitle>
              </SohozdaamCardHeader>
              <SohozdaamCardContent>
                <Textarea
                  placeholder="Any special instructions, delivery preferences, or notes for your order..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </SohozdaamCardContent>
            </SohozdaamCard>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-destructive">{error}</AlertDescription>
              </Alert>
            )}

            {/* Place Order Button */}
            <div className="pt-4">
              <Button
                onClick={handleCreateOrder}
                disabled={isLoading || !selectedAddressId || !selectedPaymentMethod}
                className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Processing Your Order...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-3" />
                    {selectedPaymentMethod === PaymentMethod.CASH_ON_DELIVERY 
                      ? `Confirm COD Order - ${formatPrice(totalAmount)}`
                      : `Place Priority Order - ${formatPrice(totalAmount)}`
                    }
                  </>
                )}
              </Button>
              
              {/* Order Summary */}
              <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Order Total:</span>
                  <span className="font-semibold text-lg text-foreground">{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Delivery:</span>
                  <span className="text-success">Priority (Fast)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainContainer>
    </ClientPageLayout>
  );
} 