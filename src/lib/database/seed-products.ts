import { prisma } from "./prisma";

export async function seedProducts() {
  try {
    // First, create a default category
    const category = await prisma.category.upsert({
      where: { slug: "essentials" },
      update: {},
      create: {
        name: "Essentials",
        slug: "essentials",
        description: "Essential grocery items",
        isActive: true,
        sortOrder: 1
      }
    });

    // Sample products data
    const products = [
      {
        name: "Basmati Rice",
        slug: "basmati-rice-5kg",
        description: "Premium quality basmati rice, perfect for daily meals",
        unit: "kg",
        unitSize: 5.0,
        mrp: 450.00,
        sellingPrice: 420.00,
        minOrderQty: 1,
        maxOrderQty: 10
      },
      {
        name: "Sunflower Oil",
        slug: "sunflower-oil-1l",
        description: "Pure sunflower cooking oil, heart healthy",
        unit: "liter",
        unitSize: 1.0,
        mrp: 120.00,
        sellingPrice: 110.00,
        minOrderQty: 1,
        maxOrderQty: 20
      },
      {
        name: "White Sugar",
        slug: "white-sugar-1kg",
        description: "Pure white crystal sugar for all your cooking needs",
        unit: "kg",
        unitSize: 1.0,
        mrp: 45.00,
        sellingPrice: 42.00,
        minOrderQty: 1,
        maxOrderQty: 25
      },
      {
        name: "Toor Dal",
        slug: "toor-dal-1kg",
        description: "Premium quality toor dal (pigeon peas)",
        unit: "kg",
        unitSize: 1.0,
        mrp: 140.00,
        sellingPrice: 130.00,
        minOrderQty: 1,
        maxOrderQty: 15
      },
      {
        name: "Wheat Flour",
        slug: "wheat-flour-5kg",
        description: "Fresh ground wheat flour, perfect for rotis and bread",
        unit: "kg",
        unitSize: 5.0,
        mrp: 200.00,
        sellingPrice: 185.00,
        minOrderQty: 1,
        maxOrderQty: 8
      },
      {
        name: "Red Onions",
        slug: "red-onions-2kg",
        description: "Fresh red onions, essential for Indian cooking",
        unit: "kg",
        unitSize: 2.0,
        mrp: 80.00,
        sellingPrice: 75.00,
        minOrderQty: 1,
        maxOrderQty: 20
      },
      {
        name: "Potatoes",
        slug: "potatoes-3kg",
        description: "Fresh potatoes, versatile vegetable for all meals",
        unit: "kg",
        unitSize: 3.0,
        mrp: 90.00,
        sellingPrice: 85.00,
        minOrderQty: 1,
        maxOrderQty: 15
      },
      {
        name: "Tea Powder",
        slug: "tea-powder-500g",
        description: "Premium black tea powder for perfect morning tea",
        unit: "grams",
        unitSize: 500.0,
        mrp: 180.00,
        sellingPrice: 165.00,
        minOrderQty: 1,
        maxOrderQty: 12
      }
    ];

    // Create products
    for (const productData of products) {
      await prisma.product.upsert({
        where: { slug: productData.slug },
        update: productData,
        create: {
          ...productData,
          categoryId: category.id,
          isActive: true
        }
      });
    }

    console.log("✅ Products seeded successfully");
    return { success: true, count: products.length };
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    throw error;
  }
}