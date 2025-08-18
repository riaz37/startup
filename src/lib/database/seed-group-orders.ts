import { prisma } from "./prisma";

export async function seedGroupOrders() {
  try {
    console.log("🌱 Starting group orders seeding...");

    // Get all products to create group orders for
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        unit: true,
        unitSize: true,
        mrp: true,
        sellingPrice: true
      }
    });

    if (products.length === 0) {
      console.log("⚠️ No products found. Please seed products first.");
      return { success: false, count: 0 };
    }

    // Sample group orders data
    const groupOrdersData = [
      {
        productId: products[0]?.id, // Basmati Rice
        batchNumber: "GO-2024-001",
        minThreshold: 5000, // 5000 BDT minimum
        currentAmount: 3200, // Already collected 3200 BDT
        targetQuantity: 100, // 100 kg target
        currentQuantity: 64, // Already collected 64 kg
        pricePerUnit: 40, // 40 BDT per kg (better than selling price)
        status: "COLLECTING" as const,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        estimatedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      },
      {
        productId: products[1]?.id, // Sunflower Oil
        batchNumber: "GO-2024-002",
        minThreshold: 3000, // 3000 BDT minimum
        currentAmount: 1800, // Already collected 1800 BDT
        targetQuantity: 50, // 50 liters target
        currentQuantity: 30, // Already collected 30 liters
        pricePerUnit: 95, // 95 BDT per liter (better than selling price)
        status: "COLLECTING" as const,
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        estimatedDelivery: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
      },
      {
        productId: products[2]?.id, // White Sugar
        batchNumber: "GO-2024-003",
        minThreshold: 1500, // 1500 BDT minimum
        currentAmount: 1500, // Threshold met!
        targetQuantity: 80, // 80 kg target
        currentQuantity: 80, // Target reached
        pricePerUnit: 38, // 38 BDT per kg (better than selling price)
        status: "THRESHOLD_MET" as const,
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        estimatedDelivery: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      },
      {
        productId: products[3]?.id, // Toor Dal
        batchNumber: "GO-2024-004",
        minThreshold: 4000, // 4000 BDT minimum
        currentAmount: 0, // Just started
        targetQuantity: 60, // 60 kg target
        currentQuantity: 0, // Just started
        pricePerUnit: 115, // 115 BDT per kg (better than selling price)
        status: "COLLECTING" as const,
        expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        estimatedDelivery: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // 18 days from now
      },
      {
        productId: products[4]?.id, // Wheat Flour
        batchNumber: "GO-2024-005",
        minThreshold: 6000, // 6000 BDT minimum
        currentAmount: 4500, // Good progress
        targetQuantity: 120, // 120 kg target
        currentQuantity: 90, // Good progress
        pricePerUnit: 170, // 170 BDT per 5kg (better than selling price)
        status: "COLLECTING" as const,
        expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
        estimatedDelivery: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      },
      {
        productId: products[5]?.id, // Red Onions
        batchNumber: "GO-2024-006",
        minThreshold: 2000, // 2000 BDT minimum
        currentAmount: 2000, // Threshold met!
        targetQuantity: 100, // 100 kg target
        currentQuantity: 100, // Target reached
        pricePerUnit: 68, // 68 BDT per 2kg (better than selling price)
        status: "ORDERED" as const,
        expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        estimatedDelivery: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
      },
      {
        productId: products[6]?.id, // Potatoes
        batchNumber: "GO-2024-007",
        minThreshold: 2500, // 2500 BDT minimum
        currentAmount: 2500, // Threshold met!
        targetQuantity: 120, // 120 kg target
        currentQuantity: 120, // Target reached
        pricePerUnit: 78, // 78 BDT per 3kg (better than selling price)
        status: "SHIPPED" as const,
        expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      },
      {
        productId: products[7]?.id, // Tea Powder
        batchNumber: "GO-2024-008",
        minThreshold: 1800, // 1800 BDT minimum
        currentAmount: 1800, // Threshold met!
        targetQuantity: 40, // 40 packets target
        currentQuantity: 40, // Target reached
        pricePerUnit: 150, // 150 BDT per 500g (better than selling price)
        status: "DELIVERED" as const,
        expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Expired 1 day ago
        estimatedDelivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Delivered 2 days ago
        actualDelivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Actually delivered 2 days ago
      }
    ];

    // Create group orders
    let createdCount = 0;
    for (const groupOrderData of groupOrdersData) {
      if (groupOrderData.productId) {
        await prisma.groupOrder.upsert({
          where: { batchNumber: groupOrderData.batchNumber },
          update: groupOrderData,
          create: groupOrderData
        });
        createdCount++;
      }
    }

    console.log(`✅ Group orders seeded successfully: ${createdCount} created/updated`);
    return { success: true, count: createdCount };
  } catch (error) {
    console.error("❌ Error seeding group orders:", error);
    throw error;
  }
} 