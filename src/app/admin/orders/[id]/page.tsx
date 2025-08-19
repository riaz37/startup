import { PageLayout, MainContainer } from "@/components/layout";
import { OrderManagementPanel } from "@/components/admin";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib";
import { prisma } from "@/lib/database";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    notFound();
  }

  // Verify the order exists
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      groupOrder: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              unit: true,
              unitSize: true,
              imageUrl: true,
            },
          },
        },
      },
      address: true,
      items: true,
      payments: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <PageLayout>
      <MainContainer>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">
            Manage order #{order.orderNumber}
          </p>
        </div>

        <OrderManagementPanel orderId={id} />
      </MainContainer>
    </PageLayout>
  );
} 