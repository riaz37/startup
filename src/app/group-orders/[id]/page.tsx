import Link from "next/link";
import { notFound } from "next/navigation";
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
    description: string | null;
    category: {
      name: string;
    };
  };
  orders: Array<{
    id: string;
    totalAmount: number;
    user: {
      name: string;
      email: string;
    };
    items: Array<{
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
  }>;
}

async function getGroupOrder(id: string): Promise<GroupOrder | null> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  
  try {
    const response = await fetch(`${baseUrl}/api/group-orders/${id}`, {
      cache: "no-store"
    });
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error("Error fetching group order:", error);
    return null;
  }
}

export default async function GroupOrderDetailPage({
  params
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  const groupOrder = await getGroupOrder(params.id);

  if (!groupOrder) {
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

  const userHasJoined = user && groupOrder.orders.some(order => order.user.email === user.email);

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
                  href="/group-orders"
                  className="ml-4 text-gray-400 hover:text-gray-500"
                >
                  Group Orders
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
                <span className="ml-4 text-gray-500">#{groupOrder.batchNumber}</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Product Image */}
          <div className="flex flex-col-reverse">
            <div className="aspect-w-1 aspect-h-1 w-full">
              {groupOrder.product.imageUrl ? (
                <img
                  src={groupOrder.product.imageUrl}
                  alt={groupOrder.product.name}
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

          {/* Group Order Info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {groupOrder.product.category.name}
              </span>
              <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${getStatusColor(groupOrder.status)}`}>
                {groupOrder.status.replace('_', ' ')}
              </span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              {groupOrder.product.name}
            </h1>

            <div className="mt-3">
              <p className="text-lg text-gray-600">
                Group Order #{groupOrder.batchNumber}
              </p>
              <p className="text-sm text-gray-500">
                {groupOrder.product.unitSize} {groupOrder.product.unit} per unit
              </p>
            </div>

            {/* Price */}
            <div className="mt-6">
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(groupOrder.pricePerUnit)}
                </span>
                <span className="text-sm text-gray-500">
                  per {groupOrder.product.unit}
                </span>
              </div>
              <p className="mt-1 text-sm text-green-600 font-medium">
                Bulk pricing - Save with group orders!
              </p>
            </div>

            {/* Progress */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress to minimum threshold</span>
                <span>{Math.round(groupOrder.progressPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(groupOrder.progressPercentage, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>{formatPrice(groupOrder.currentAmount)} collected</span>
                <span>{formatPrice(groupOrder.minThreshold)} needed</span>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-semibold text-gray-900">
                  {groupOrder.participantCount}
                </div>
                <div className="text-xs text-gray-500">Participants</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-semibold text-gray-900">
                  {groupOrder.currentQuantity}
                </div>
                <div className="text-xs text-gray-500">
                  of {groupOrder.targetQuantity} {groupOrder.product.unit}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-semibold text-gray-900">
                  {groupOrder.timeRemaining}
                </div>
                <div className="text-xs text-gray-500">Days left</div>
              </div>
            </div>

            {/* Description */}
            {groupOrder.product.description && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900">Description</h3>
                <div className="mt-2 prose prose-sm text-gray-500">
                  <p>{groupOrder.product.description}</p>
                </div>
              </div>
            )}

            {/* Delivery Info */}
            {groupOrder.estimatedDelivery && (
              <div className="mt-6 bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Delivery Information</h3>
                <p className="text-sm text-blue-700">
                  Estimated delivery: {new Date(groupOrder.estimatedDelivery).toLocaleDateString()}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Delivery date may vary based on order fulfillment
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex space-x-4">
              {user ? (
                userHasJoined ? (
                  <div className="flex-1 bg-green-100 border border-green-200 rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-green-800">
                    ✓ You've joined this group order
                  </div>
                ) : groupOrder.status === "COLLECTING" ? (
                  <Link
                    href={`/group-orders/${groupOrder.id}/join`}
                    className="flex-1 bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Join Group Order
                  </Link>
                ) : (
                  <div className="flex-1 bg-gray-100 border border-gray-200 rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-gray-500">
                    Order no longer accepting participants
                  </div>
                )
              ) : (
                <Link
                  href="/auth/signin"
                  className="flex-1 bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign in to Join
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Participants Section */}
        {groupOrder.orders.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Participants</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {groupOrder.orders.map((order, index) => (
                  <li key={order.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-indigo-600">
                                {order.user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">
                              {order.user.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Ordered {order.items[0]?.quantity || 0} {groupOrder.product.unit}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(order.totalAmount)}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}