import { getCurrentUser } from "@/lib";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/database";
import { PriceHistoryWrapper } from "@/components/products/price-history-wrapper";
import { PageLayout, PageHeader, MainContainer } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Package, 
  Star, 
  Users, 
  Calendar,
  MapPin,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  Clock,
  Tag
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  unit: string;
  unitSize: number;
  mrp: number;
  sellingPrice: number;
  minOrderQty: number;
  maxOrderQty: number | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    user: {
      name: string;
    };
  }>;
  avgRating: number;
  reviewCount: number;
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!product) {
      return null;
    }

    // Calculate average rating and review count
    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0;

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      imageUrl: product.imageUrl,
      unit: product.unit,
      unitSize: product.unitSize,
      mrp: product.mrp,
      sellingPrice: product.sellingPrice,
      minOrderQty: product.minOrderQty,
      maxOrderQty: product.maxOrderQty,
      category: {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
      },
      reviews: product.reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
        user: {
          name: review.user.name,
        },
      })),
      avgRating,
      reviewCount: product.reviews.length,
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

function renderStars(rating: number) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
    );
  }

  if (hasHalfStar) {
    stars.push(
      <Star key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />
    );
  }

  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
    );
  }

  return stars;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  const user = await getCurrentUser();

  if (!product) {
    notFound();
  }

  const discount = product.mrp > product.sellingPrice 
    ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
    : 0;

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

        {/* Product Header */}
        <PageHeader
          badge={product.category.name}
          title={product.name}
          highlightedWord={product.name}
          description={`${product.unitSize} ${product.unit} units - Premium quality product`}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image Section */}
          <div className="space-y-4">
            <Card className="overflow-hidden border-2 border-primary/10">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="w-full h-96 bg-muted flex items-center justify-center">
                  <Package className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              <div className="flex space-x-3">
                <Button className="flex-1 bg-primary hover:bg-primary/90" asChild>
                  <Link href={`/group-orders/create?productId=${product.id}`}>
                    <Users className="h-4 w-4 mr-2" />
                    Join Group Order
                  </Link>
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Group Order Info */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-800 mb-1">Save with Group Orders</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Join group orders to get discounted prices and free delivery. Perfect for bulk purchases.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="space-y-6">
            {/* Price and Rating */}
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-primary">
                      {formatPrice(product.sellingPrice)}
                    </h2>
                    {discount > 0 && (
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-lg text-gray-500 line-through">
                          {formatPrice(product.mrp)}
                        </span>
                        <Badge className="bg-green-500 text-white">
                          {discount}% OFF
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {product.reviewCount > 0 && (
                    <div className="text-right">
                      <div className="flex items-center mb-1">
                        {renderStars(product.avgRating)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {product.avgRating.toFixed(1)} out of 5 ({product.reviewCount} reviews)
                      </p>
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  Price per {product.unitSize} {product.unit}
                </p>

                {/* Quick Add to Cart */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Quantity</span>
                    <span className="text-sm text-muted-foreground">
                      Min: {product.minOrderQty} • Max: {product.maxOrderQty || 'No limit'}
                    </span>
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90" asChild>
                    <Link href={`/priority-orders/create?productId=${product.id}`}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart - Priority Order
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Product Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Product Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">Unit Size</span>
                    <span className="text-sm font-medium">{product.unitSize} {product.unit}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">Minimum Order</span>
                    <span className="text-sm font-medium">{product.minOrderQty} {product.unit}</span>
                  </div>
                  {product.maxOrderQty && (
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">Maximum Order</span>
                      <span className="text-sm font-medium">{product.maxOrderQty} {product.unit}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <Badge variant="outline" className="text-xs">
                      {product.category.name}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {product.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Price History */}
            <PriceHistoryWrapper
              productId={product.id}
              currentMrp={product.mrp}
              currentSellingPrice={product.sellingPrice}
            />
          </div>
        </div>

        {/* Reviews Section */}
        {product.reviews.length > 0 && (
          <div className="mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Customer Reviews ({product.reviewCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="border-b border-border pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {review.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {review.user.name}
                            </p>
                            <div className="flex items-center">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-muted-foreground ml-11">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Related Products or CTA */}
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="pt-8 pb-8 text-center">
            <h3 className="text-xl font-semibold text-primary mb-2">
              Ready to Order?
            </h3>
            <p className="text-muted-foreground mb-4">
              Join a group order to get the best prices and fastest delivery
            </p>
            <div className="flex justify-center space-x-3">
              <Button className="bg-primary hover:bg-primary/90">
                <Users className="h-4 w-4 mr-2" />
                Find Group Orders
              </Button>
              <Button variant="outline">
                <Truck className="h-4 w-4 mr-2" />
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </MainContainer>
    </PageLayout>
  );
}
