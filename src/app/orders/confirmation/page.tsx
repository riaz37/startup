import { Suspense } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  placedAt: string;
  groupOrder: {
    batchNumber: string;
    estimatedDelivery: string | null;
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
}

async function getOrder(orderId: string, userId: string): Promise<Order | null> {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: userId
      },
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
        address: true,
        items: true
      }
    });

    return order;
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
}

async function OrderConfirmationContent({ orderId }: { orderId: string }) {
  const user = await getCurrentUser();
  
  if (!user) {
    return (
      <div className="text-center">
        <p className="text-gray-600">Please sign in to view your order.</p>
        <Link
          href="/auth/signin"
          className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const order = await getOrder(orderId, user.id);

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

  return (
    <div className="max-w-3xl mx-auto">
      {/* Success Message */}
      <div className="text-center mb-8">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Order Confirmed!</h1>
        <p className="mt-2 text-lg text-gray-600">
          Thank you for joining the group order
        </p>
        <p className="text-sm text-gray-500">
          Order #{order.orderNumber}
        </p>
      </div>

      {/* Order Details */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Order Details</h2>
        </div>
        
        <div className="px-6 py-4">
          {/* Product Info */}
          <div className="flex items-start space-x-4 mb-6">
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
              <h3 className="text-lg font-medium text-gray-900">
                {order.groupOrder.product.name}
              </h3>
              <p className="text-sm text-gray-600">
                Group Order #{order.groupOrder.batchNumber}
              </p>
              <div className="mt-2 flex justify-between">
                <span className="text-sm text-gray-600">
                  Quantity: {order.items[0]?.quantity} {order.groupOrder.product.unit}
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">Order Status</dt>
              <dd className="mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {order.status.replace('_', ' ')}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
              <dd className="mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {order.paymentStatus.replace('_', ' ')}
                </span>
              </dd>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Delivery Information</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm">
                <p className="font-medium text-gray-900">{order.address.name}</p>
                <p className="text-gray-600">{order.address.phone}</p>
                <p className="text-gray-600 mt-1">
                  {order.address.addressLine1}
                  {order.address.addressLine2 && `, ${order.address.addressLine2}`}
                </p>
                <p className="text-gray-600">
                  {order.address.city}, {order.address.state} - {order.address.pincode}
                </p>
              </div>
              {order.groupOrder.estimatedDelivery && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Estimated Delivery:</span>{" "}
                    {new Date(order.groupOrder.estimatedDelivery).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">What happens next?</h3>
        <ul className="text-sm text-blue-700 space-y-2">
          <li className="flex items-start">
            <span className="flex-shrink-0 h-1.5 w-1.5 bg-blue-400 rounded-full mt-2 mr-3"></span>
            Your order is now part of the group order and will be processed once the minimum threshold is met.
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 h-1.5 w-1.5 bg-blue-400 rounded-full mt-2 mr-3"></span>
            You'll receive email updates about the group order progress and delivery status.
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 h-1.5 w-1.5 bg-blue-400 rounded-full mt-2 mr-3"></span>
            Payment will be processed when the group order is confirmed and ready for delivery.
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Link
          href="/dashboard"
          className="flex-1 bg-indigo-600 border border-transparent rounded-md py-3 px-4 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          View Dashboard
        </Link>
        <Link
          href="/group-orders"
          className="flex-1 bg-white border border-gray-300 rounded-md py-3 px-4 flex items-center justify-center text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Browse More Orders
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage({
  searchParams
}: {
  searchParams: { orderId?: string };
}) {
  const orderId = searchParams.orderId;

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Order Not Found</h1>
          <p className="mt-2 text-gray-600">No order ID provided.</p>
          <Link
            href="/group-orders"
            className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Browse Group Orders
          </Link>
        </div>
      </div>
    );
  }

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
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Suspense
            fallback={
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading order details...</p>
              </div>
            }
          >
            <OrderConfirmationContent orderId={orderId} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}