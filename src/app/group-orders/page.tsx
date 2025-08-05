import Link from "next/link";
import { getCurrentUser } from "@/lib/auth-utils";

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
  progressPercentage: number;
  participantCount: number;
  timeRemaining: number;
  product: {
    id: string;
    name: string;
    unit: string;
    unitSize: number;
    imageUrl: string | null;
    category: {
      name: string;
    };
  };
}

interface GroupOrdersResponse {
  groupOrders: GroupOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

async function getGroupOrders(): Promise<GroupOrdersResponse> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  
  try {
    const response = await fetch(`${baseUrl}/api/group-orders?status=COLLECTING`, {
      cache: "no-store"
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch group orders");
    }
    
    return response.json();
  } catch (error) {
    console.error("Error fetching group orders:", error);
    return {
      groupOrders: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 0 }
    };
  }
}

export default async function GroupOrdersPage() {
  const user = await getCurrentUser();
  const { groupOrders } = await getGroupOrders();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COLLECTING":
        return "bg-blue-100 text-blue-800";
      case "THRESHOLD_MET":
        return "bg-green-100 text-green-800";
      case "ORDERED":
        return "bg-yellow-100 text-yellow-800";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800";
      case "DELIVERED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
              <div className="ml-10 space-x-8">
                <Link
                  href="/products"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Products
                </Link>
                <Link
                  href="/group-orders"
                  className="text-indigo-600 hover:text-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Group Orders
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
            <h1 className="text-3xl font-bold text-gray-900">Active Group Orders</h1>
            <p className="mt-2 text-sm text-gray-600">
              Join group orders to get bulk pricing on essential items
            </p>
          </div>

          {groupOrders.length === 0 ? (
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No active group orders</h3>
              <p className="mt-1 text-sm text-gray-500">
                Check back later for new group ordering opportunities.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {groupOrders.map((groupOrder) => (
                <div
                  key={groupOrder.id}
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {groupOrder.product.category.name}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(groupOrder.status)}`}>
                          {groupOrder.status.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        #{groupOrder.batchNumber}
                      </span>
                    </div>

                    {/* Product Info */}
                    <div className="flex items-start space-x-4 mb-4">
                      {groupOrder.product.imageUrl ? (
                        <img
                          src={groupOrder.product.imageUrl}
                          alt={groupOrder.product.name}
                          className="h-16 w-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="h-8 w-8 text-gray-400"
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
                          {groupOrder.product.unitSize} {groupOrder.product.unit}
                        </p>
                        <p className="text-lg font-bold text-indigo-600">
                          {formatPrice(groupOrder.pricePerUnit)} per {groupOrder.product.unit}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(groupOrder.progressPercentage)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(groupOrder.progressPercentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{formatPrice(groupOrder.currentAmount)} collected</span>
                        <span>{formatPrice(groupOrder.minThreshold)} needed</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {groupOrder.participantCount}
                        </div>
                        <div className="text-xs text-gray-500">Participants</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {groupOrder.currentQuantity}
                        </div>
                        <div className="text-xs text-gray-500">
                          of {groupOrder.targetQuantity} {groupOrder.product.unit}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {groupOrder.timeRemaining}
                        </div>
                        <div className="text-xs text-gray-500">Days left</div>
                      </div>
                    </div>

                    {/* Estimated Delivery */}
                    {groupOrder.estimatedDelivery && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Estimated Delivery:</span>{" "}
                          {new Date(groupOrder.estimatedDelivery).toLocaleDateString()}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="flex space-x-3">
                      <Link
                        href={`/group-orders/${groupOrder.id}`}
                        className="flex-1 bg-indigo-600 border border-transparent rounded-md py-2 px-4 flex items-center justify-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        View Details
                      </Link>
                      {user && groupOrder.status === "COLLECTING" && (
                        <Link
                          href={`/group-orders/${groupOrder.id}/join`}
                          className="flex-1 bg-green-600 border border-transparent rounded-md py-2 px-4 flex items-center justify-center text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Join Order
                        </Link>
                      )}
                    </div>
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