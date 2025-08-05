import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-utils";

interface OrderDetail {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  placedAt: string;
  confirmedAt: string | null;
  deliveredAt: string | null;
  groupOrder: {
    id: string;
    batchNumber: string;
    status: string;
    estimatedDelivery: string | null;
    actualDelivery: string | null;
    product: {
      name: string;
      unit: string;
      unitSize: number;
      imageUrl: string | null;
    };
  };
  address: {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    pincode: string;
  };
  items: Array<{
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  delivery: {
    deliveryType: string;
    status: string;
    trackingNumber: string | null;
    estimatedDate: string | null;
    actualDate: string | null;
    pickupLocation: {
      name: string;
      address: string;
      contactPhone: string;
    } | null;
  } | null;
  statusSteps: Array<{
    key: string;
    label: string;
    description: string;
  }>;
  currentStepIndex: number;
  progress: number;
}

async function getOrderDetail(orderId: string): Promise<OrderDetail | null> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  
  try {
    const response = await fetch(`${baseUrl}/api/orders/${orderId}`, {
      cache: "no-store"
    });
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error("Error fetching order detail:", error);
    return null;
  }
}

export default async function OrderDetailPage({
  params
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  const order = await getOrderDetail(params.id);

  if (!order) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
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
                  href="/orders"
                  className="text-indigo-600 hover:text-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
                >
                  My Orders
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
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
                  href="/orders"
                  className="ml-4 text-gray-400 hover:text-gray-500"
                >
                  My Orders
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
                <span className="ml-4 text-gray-500">#{order.orderNumber}</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
          <p className="mt-2 text-sm text-gray-600">
            Placed on {formatDate(order.placedAt)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Progress */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Order Progress</h2>
              
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(order.progress)}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${order.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Status Steps */}
              <div className="space-y-4">
                {order.statusSteps.map((step, index) => {
                  const isCompleted = index <= order.currentStepIndex;
                  const isCurrent = index === order.currentStepIndex;
                  
                  return (
                    <div key={step.key} className="flex items-start">
                      <div className="flex-shrink-0">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            isCompleted
                              ? "bg-indigo-600 text-white"
                              : "bg-gray-200 text-gray-400"
                          }`}
                        >
                          {isCompleted ? (
                            <svg
                              className="h-5 w-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <span className="text-sm font-medium">{index + 1}</span>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3
                          className={`text-sm font-medium ${
                            isCurrent ? "text-indigo-600" : isCompleted ? "text-gray-900" : "text-gray-500"
                          }`}
                        >
                          {step.label}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {step.description}
                        </p>
                        {isCurrent && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              Current Status
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Product Details</h2>
              
              <div className="flex items-start space-x-4">
                {order.groupOrder.product.imageUrl ? (
                  <img
                    src={order.groupOrder.product.imageUrl}
                    alt={order.groupOrder.product.name}
                    className="h-20 w-20 object-cover rounded-lg"
                  />
                ) : (
                  <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="h-10 w-10 text-gray-400"
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
                    {order.groupOrder.product.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Group Order #{order.groupOrder.batchNumber}
                  </p>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="text-gray-900">
                        {order.items[0]?.quantity} {order.groupOrder.product.unit}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Unit Price:</span>
                      <span className="text-gray-900">
                        {formatPrice(order.items[0]?.unitPrice || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>{formatPrice(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Order Status */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Status</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Order Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Payment Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.paymentStatus === "COMPLETED" ? "bg-green-100 text-green-800" :
                    order.paymentStatus === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {order.paymentStatus.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Group Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.groupOrder.status)}`}>
                    {order.groupOrder.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Delivery Information</h2>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-900">{order.address.name}</span>
                  <p className="text-gray-600">{order.address.phone}</p>
                </div>
                <div className="text-gray-600">
                  <p>{order.address.addressLine1}</p>
                  {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
                  <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                </div>
                
                {order.groupOrder.estimatedDelivery && (
                  <div className="pt-3 border-t">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Delivery:</span>
                      <span className="text-gray-900">
                        {new Date(order.groupOrder.estimatedDelivery).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}

                {order.groupOrder.actualDelivery && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Actual Delivery:</span>
                    <span className="text-gray-900">
                      {new Date(order.groupOrder.actualDelivery).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Timeline</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Placed:</span>
                  <span className="text-gray-900">
                    {new Date(order.placedAt).toLocaleDateString()}
                  </span>
                </div>
                
                {order.confirmedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Confirmed:</span>
                    <span className="text-gray-900">
                      {new Date(order.confirmedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {order.deliveredAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivered:</span>
                    <span className="text-gray-900">
                      {new Date(order.deliveredAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Actions</h2>
              
              <div className="space-y-3">
                <Link
                  href={`/group-orders/${order.groupOrder.id}`}
                  className="w-full bg-indigo-600 border border-transparent rounded-md py-2 px-4 flex items-center justify-center text-sm font-medium text-white hover:bg-indigo-700"
                >
                  View Group Order
                </Link>
                
                <Link
                  href="/orders"
                  className="w-full bg-white border border-gray-300 rounded-md py-2 px-4 flex items-center justify-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Back to Orders
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}