import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface OrderHistoryProps {
  userId: string;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  placedAt: string;
  groupOrder: {
    batchNumber: string;
    status: string;
    product: {
      name: string;
      imageUrl: string | null;
    };
  };
  items: Array<{
    quantity: number;
  }>;
}

async function getRecentOrders(userId: string): Promise<RecentOrder[]> {
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        groupOrder: {
          include: {
            product: {
              select: {
                name: true,
                imageUrl: true
              }
            }
          }
        },
        items: {
          select: {
            quantity: true
          }
        }
      },
      orderBy: {
        placedAt: "desc"
      },
      take: 5 // Show only recent 5 orders
    });

    return orders;
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    return [];
  }
}

export default async function OrderHistoryWidget({ userId }: OrderHistoryProps) {
  const recentOrders = await getRecentOrders(userId);

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

  if (recentOrders.length === 0) {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
            <Link
              href="/orders"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              View all
            </Link>
          </div>
          <div className="mt-6 text-center">
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
            <h4 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h4>
            <p className="mt-1 text-sm text-gray-500">
              Start by joining a group order
            </p>
            <div className="mt-4">
              <Link
                href="/group-orders"
                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Browse Group Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
          <Link
            href="/orders"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            View all
          </Link>
        </div>
        
        <div className="space-y-4">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              {order.groupOrder.product.imageUrl ? (
                <img
                  src={order.groupOrder.product.imageUrl}
                  alt={order.groupOrder.product.name}
                  className="h-12 w-12 object-cover rounded-lg"
                />
              ) : (
                <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
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
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {order.groupOrder.product.name}
                </p>
                <p className="text-xs text-gray-500">
                  #{order.orderNumber} • Qty: {order.items[0]?.quantity || 0}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.groupOrder.status)}`}>
                    {order.groupOrder.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {formatPrice(order.totalAmount)}
                </p>
                <Link
                  href={`/orders/${order.id}`}
                  className="text-xs text-indigo-600 hover:text-indigo-500"
                >
                  Track
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}