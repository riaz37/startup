import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-utils";

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
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  
  try {
    const response = await fetch(`${baseUrl}/api/products/${id}`, {
      cache: "no-store"
    });
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export default async function ProductDetailPage({
  params
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const calculateDiscount = (mrp: number, sellingPrice: number) => {
    return Math.round(((mrp - sellingPrice) / mrp) * 100);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

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
              <div className="ml-10">
                <Link
                  href="/products"
                  className="text-indigo-600 hover:text-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Products
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-700">
                    Welcome, {user.name}
                  </span>
                  <Link
                    href="/dashboard"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <Link href="/" className="text-gray-400 hover:text-gray-500">
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <Link
                  href="/products"
                  className="ml-4 text-gray-400 hover:text-gray-500"
                >
                  Products
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="ml-4 text-gray-500">{product.name}</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Product Details */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Product Image */}
          <div className="flex flex-col-reverse">
            <div className="aspect-w-1 aspect-h-1 w-full">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-center object-cover sm:rounded-lg"
                />
              ) : (
                <div className="w-full h-96 bg-gray-100 flex items-center justify-center sm:rounded-lg">
                  <svg
                    className="h-24 w-24 text-gray-400"
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
            </div>
          </div>

          {/* Product Info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {product.category.name}
              </span>
              {calculateDiscount(product.mrp, product.sellingPrice) > 0 && (
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {calculateDiscount(product.mrp, product.sellingPrice)}% OFF
                </span>
              )}
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              {product.name}
            </h1>

            <div className="mt-3">
              <p className="text-lg text-gray-600">
                {product.unitSize} {product.unit}
              </p>
            </div>

            {/* Reviews */}
            {product.reviewCount > 0 && (
              <div className="mt-3 flex items-center">
                <div className="flex items-center">
                  {renderStars(product.avgRating)}
                </div>
                <p className="ml-2 text-sm text-gray-500">
                  {product.avgRating.toFixed(1)} out of 5 stars ({product.reviewCount} reviews)
                </p>
              </div>
            )}

            {/* Price */}
            <div className="mt-6">
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.sellingPrice)}
                </span>
                {product.mrp > product.sellingPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.mrp)}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Price per {product.unit}
              </p>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900">Description</h3>
                <div className="mt-2 prose prose-sm text-gray-500">
                  <p>{product.description}</p>
                </div>
              </div>
            )}

            {/* Order Info */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Order Information</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Minimum order quantity: {product.minOrderQty} {product.unit}</p>
                {product.maxOrderQty && (
                  <p>Maximum order quantity: {product.maxOrderQty} {product.unit}</p>
                )}
                <p>Unit size: {product.unitSize} {product.unit}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex space-x-4">
              {user ? (
                <button className="flex-1 bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Add to Group Order
                </button>
              ) : (
                <Link
                  href="/auth/signin"
                  className="flex-1 bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign in to Order
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {product.reviews.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
            <div className="space-y-6">
              {product.reviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{review.user.name}</span>
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}