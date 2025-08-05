import Link from "next/link";
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
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

async function getProducts(): Promise<ProductsResponse> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  
  try {
    const response = await fetch(`${baseUrl}/api/products`, {
      cache: "no-store"
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    
    return response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      products: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 0 }
    };
  }
}

export default async function ProductsPage() {
  const user = await getCurrentUser();
  const { products } = await getProducts();

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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="mt-2 text-sm text-gray-600">
              Browse our selection of essential grocery items with bulk pricing
            </p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                <svg
                  className="h-6 w-6 text-gray-400"
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Products will appear here once they are added to the catalog.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => {
                    fetch("/api/seed", { method: "POST" })
                      .then(() => window.location.reload())
                      .catch(console.error);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Seed Sample Products
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
                >
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-48 w-full object-cover object-center"
                      />
                    ) : (
                      <div className="h-48 w-full bg-gray-100 flex items-center justify-center">
                        <svg
                          className="h-12 w-12 text-gray-400"
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
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {product.category.name}
                      </span>
                      {calculateDiscount(product.mrp, product.sellingPrice) > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {calculateDiscount(product.mrp, product.sellingPrice)}% OFF
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {product.name}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {product.unitSize} {product.unit}
                    </p>
                    
                    {product.description && (
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(product.sellingPrice)}
                        </span>
                        {product.mrp > product.sellingPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.mrp)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-3">
                      Min order: {product.minOrderQty} {product.unit}
                      {product.maxOrderQty && (
                        <span> • Max: {product.maxOrderQty} {product.unit}</span>
                      )}
                    </div>
                    
                    <Link
                      href={`/products/${product.id}`}
                      className="w-full bg-indigo-600 border border-transparent rounded-md py-2 px-4 flex items-center justify-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}