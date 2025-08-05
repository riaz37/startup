import Link from "next/link";
import { requireAdmin } from "@/lib/auth-utils";

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
  };
}

async function getAdminGroupOrders(): Promise<GroupOrder[]> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  
  try {
    const response = await fetch(`${baseUrl}/api/group-orders`, {
      cache: "no-store"
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch group orders");
    }
    
    const data = await response.json();
    return data.groupOrders;
  } catch (error) {
    console.error("Error fetching group orders:", error);
    return [];
  }
}

export default async function AdminDashboardPage() {
  const user = await requireAdmin();
  const groupOrders = await getAdminGroupOrders();

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

  const activeOrders = groupOrders.filter(order => 
    order.status === "COLLECTING" || order.status === "THRESHOLD_MET"
  );
  const completedOrders = groupOrders.filter(order => 
    order.status === "DELIVERED"
  );
  const totalRevenue = groupOrders.reduce((sum, order) => sum + order.currentAmount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Admin Dashboard
              </Link>
              <div className="ml-10 space-x-8">
                <Link
                  href="/admin"
                  className="text-indigo-600 hover:text-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/group-orders/create"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Create Group Order
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user.name} ({user.role})
              </span>
              <Link
                href="/dashboard"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                User Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Overview */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
            
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
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
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Group Orders
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {groupOrders.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
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
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Active Orders
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {activeOrders.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Completed Orders
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {completedOrders.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
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
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Revenue
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {formatPrice(totalRevenue)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="flex space-x-4">
              <Link
                href="/admin/group-orders/create"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Create New Group Order
              </Link>
              <Link
                href="/products"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                View Products
              </Link>
            </div>
          </div>

          {/* Group Orders Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                All Group Orders
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Monitor and manage all group orders
              </p>
            </div>
            <ul className="divide-y divide-gray-200">
              {groupOrders.length === 0 ? (
                <li className="px-4 py-4 text-center text-gray-500">
                  No group orders found
                </li>
              ) : (
                groupOrders.map((order) => (
                  <li key={order.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-indigo-600 truncate">
                                {order.product.name}
                              </p>
                              <p className="ml-2 text-sm text-gray-500">
                                #{order.batchNumber}
                              </p>
                            </div>
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <p>
                                {formatPrice(order.currentAmount)} / {formatPrice(order.minThreshold)} 
                                ({Math.round(order.progressPercentage)}%)
                              </p>
                              <span className="mx-2">•</span>
                              <p>{order.participantCount} participants</p>
                              <span className="mx-2">•</span>
                              <p>{order.timeRemaining} days left</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {order.status === "THRESHOLD_MET" && (
                            <button
                              onClick={() => {
                                fetch(`/api/group-orders/${order.id}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ status: "ORDERED" })
                                }).then(() => window.location.reload());
                              }}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-xs font-medium"
                            >
                              Mark as Ordered
                            </button>
                          )}
                          {order.status === "ORDERED" && (
                            <button
                              onClick={() => {
                                fetch(`/api/group-orders/${order.id}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ status: "SHIPPED" })
                                }).then(() => window.location.reload());
                              }}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs font-medium"
                            >
                              Mark as Shipped
                            </button>
                          )}
                          {order.status === "SHIPPED" && (
                            <button
                              onClick={() => {
                                const actualDelivery = new Date().toISOString();
                                fetch(`/api/group-orders/${order.id}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ 
                                    status: "DELIVERED",
                                    actualDelivery 
                                  })
                                }).then(() => window.location.reload());
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium"
                            >
                              Mark as Delivered
                            </button>
                          )}
                          <Link
                            href={`/admin/group-orders/${order.id}`}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}