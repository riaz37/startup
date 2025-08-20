"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/stores/cart-store";
import { PageLayout, PageHeader, MainContainer } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LazyImage } from "@/components/ui/lazy-load";
import { ShoppingCart, MapPin, Truck, CreditCard, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

interface CartItem {
  id: string;
  productId: string;
  name: string;
  imageUrl?: string;
  unitSize: number;
  unit: string;
  quantity: number;
  sellingPrice: number;
  orderType: 'priority' | 'group';
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { cart, clearCart } = useCartStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [deliveryType, setDeliveryType] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  // Load user addresses
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const response = await fetch('/api/addresses');
        if (response.ok) {
          const data = await response.json();
          setAddresses(data.addresses);
          
          // Select default address if available
          const defaultAddress = data.addresses.find((addr: Address) => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
          } else if (data.addresses.length > 0) {
            setSelectedAddressId(data.addresses[0].id);
          }
        }
      } catch (error) {
        console.error('Error loading addresses:', error);
        toast.error('Failed to load addresses');
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    if (session?.user?.id) {
      loadAddresses();
    }
  }, [session?.user?.id]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!session?.user?.id) {
      router.push('/auth/signin?callbackUrl=/checkout');
    }
  }, [session, router]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart && cart.items.length === 0) {
      router.push('/products');
    }
  }, [cart, router]);

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }

    if (!deliveryType) {
      toast.error('Please select a delivery type');
      return;
    }

    // Filter only priority order items
    const priorityItems = cart?.items.filter(item => item.orderType === 'priority') || [];
    
    if (priorityItems.length === 0) {
      toast.error('No priority order items in cart');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addressId: selectedAddressId,
          deliveryType,
          notes,
          cartItems: priorityItems,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Checkout failed');
      }

      const result = await response.json();
      
      toast.success(result.message);
      
      // Clear cart and redirect to order confirmation
      await clearCart();
      router.push(`/orders/${result.orders[0].id}`);
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Checkout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateTotal = () => {
    if (!cart) return 0;
    return cart.items
      .filter(item => item.orderType === 'priority')
      .reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
  };

  const priorityItems = cart?.items.filter(item => item.orderType === 'priority') || [];

  if (!session?.user?.id) {
    return null; // Will redirect
  }

  if (cart?.items.length === 0) {
    return null; // Will redirect
  }

  return (
    <PageLayout>
      <MainContainer>
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            href="/products"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </div>

        {/* Page Header */}
        <PageHeader
          title="Checkout"
          highlightedWord="Checkout"
          description="Complete your priority order"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingAddresses ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Loading addresses...</p>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-3">No addresses found</p>
                    <Button asChild variant="outline">
                      <Link href="/dashboard?tab=addresses">Add Address</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedAddressId === address.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedAddressId(address.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{address.name}</span>
                              {address.isDefault && (
                                <Badge variant="secondary" className="text-xs">Default</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{address.phone}</p>
                            <p className="text-sm text-muted-foreground">
                              {address.address}, {address.city} {address.postalCode}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delivery Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Delivery Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryType">Delivery Type</Label>
                  <Select value={deliveryType} onValueChange={setDeliveryType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select delivery type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HOME_DELIVERY">Home Delivery</SelectItem>
                      <SelectItem value="PICKUP">Pickup from Store</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special instructions for delivery..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {priorityItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        {item.imageUrl ? (
                          <LazyImage
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                            <span className="text-muted-foreground text-xs">No Image</span>
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.unitSize} {item.unit}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-semibold text-primary">
                          {formatPrice(item.sellingPrice * item.quantity)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(item.sellingPrice)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-primary">{formatPrice(calculateTotal())}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Priority orders are delivered within 24-48 hours
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              disabled={isLoading || !selectedAddressId || !deliveryType || priorityItems.length === 0}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Complete Order
                </div>
              )}
            </Button>

            {/* Terms */}
            <p className="text-xs text-muted-foreground text-center">
              By completing this order, you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </MainContainer>
    </PageLayout>
  );
} 