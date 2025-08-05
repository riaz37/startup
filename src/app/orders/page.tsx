import Link from "next/link";
import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  placedAt: string;
  groupOrder: {
    batchNumber: string;
    status: string;
    estimatedDelivery: string | null;
    product: {
      name: string;
      unit: string;
      unitSize: number;
      imageUrl: string | null;
    };
  };
  items: Array<{
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        groupOrder: {
          include: {
            product: {
              select: {
                name: true,
                unit: true,
                unitSize: true,
                imageUrl: true
              }
            }
          }
        },
        items: true
      },
      orderBy: {
        placedAt: "desc"
      }
    });

    return orders;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }
}

export default async function OrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const orders = await getUserOrders(user.id);

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
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "PROCESSING":
        return "bg-purple-100 text-purple-800";
      case "SHIPPED":
        return "bg-indigo-100 text-indigo-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
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
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Group Orders
                </Link>
                <Link
                  href="/orders"
                  className="text-indigo-600 hover:text-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
                >
                  My Orders
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user.name}
              </span>
              <Link
                href="/dashboard"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="mt-2 text-sm text-gray-600">
              Track your group order participations and delivery status
            </p>
          </div>

          {orders.length === 0 ? (
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
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't joined any group orders yet.
              </p>
              <div className="mt-6">
                <Link
                  href="/group-orders"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Browse Group Orders
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white shadow rounded-lg overflow-hidden"
                >
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Placed on {new Date(order.placedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4">
                    <div className="flex items-start space-x-4">
                      {order.groupOrder.product.imageUrl ? (
                        <img
                          src={order.groupOrder.product.imageUrl}
                          alt={order.groupOrder.product.name}
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
                        <h4 className="text-lg font-medium text-gray-900">
                          {order.groupOrder.product.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Group Order #{order.groupOrder.batchNumber}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            <span>Quantity: {order.items[0]?.quantity} {order.groupOrder.product.unit}</span>
                            <span className="mx-2">•</span>
                            <span>Unit Price: {formatPrice(order.items[0]?.unitPrice || 0)}</span>
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            {formatPrice(order.totalAmount)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Group Order Status */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Group Order Status:</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.groupOrder.status)}`}>
                          {order.groupOrder.status.replace('_', ' ')}
                        </span>
                      </div>
                      {order.groupOrder.estimatedDelivery && (
                        <div className="flex items-center justify-between text-sm mt-2">
                          <span className="text-gray-600">Estimated Delivery:</span>
                          <span className="text-gray-900">
                            {new Date(order.groupOrder.estimatedDelivery).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 flex justify-end space-x-3">
                      <Link
                        href={`/group-orders/${order.groupOrder.id}`}
                        className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                      >
                        View Group Order
                      </Link>
                      <Link
                        href={`/orders/${order.id}`}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm font-medium"
                      >
                        Track Order
                      </Link>
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