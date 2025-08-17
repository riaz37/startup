import { prisma } from "./prisma";

export async function seedCategories() {
  try {
    console.log("🌱 Starting category seeding...");

    // Define comprehensive grocery categories
    const categories = [
      {
        name: "Grains & Cereals",
        slug: "grains-cereals",
        description: "Rice, wheat, pulses, and other staple grains",
        sortOrder: 1,
        isActive: true
      },
      {
        name: "Cooking Oils & Ghee",
        slug: "cooking-oils-ghee",
        description: "Vegetable oils, ghee, and cooking fats",
        sortOrder: 2,
        isActive: true
      },
      {
        name: "Dairy & Eggs",
        slug: "dairy-eggs",
        description: "Milk, curd, cheese, butter, and eggs",
        sortOrder: 3,
        isActive: true
      },
      {
        name: "Fresh Vegetables",
        slug: "fresh-vegetables",
        description: "Fresh seasonal and year-round vegetables",
        sortOrder: 4,
        isActive: true
      },
      {
        name: "Fresh Fruits",
        slug: "fresh-fruits",
        description: "Fresh seasonal and imported fruits",
        sortOrder: 5,
        isActive: true
      },
      {
        name: "Spices & Masalas",
        slug: "spices-masalas",
        description: "Whole spices, ground spices, and spice blends",
        sortOrder: 6,
        isActive: true
      },
      {
        name: "Beverages",
        slug: "beverages",
        description: "Tea, coffee, juices, and soft drinks",
        sortOrder: 7,
        isActive: true
      },
      {
        name: "Snacks & Namkeen",
        slug: "snacks-namkeen",
        description: "Packaged snacks, chips, and traditional namkeen",
        sortOrder: 8,
        isActive: true
      },
      {
        name: "Bakery & Breads",
        slug: "bakery-breads",
        description: "Fresh breads, cakes, cookies, and pastries",
        sortOrder: 9,
        isActive: true
      },
      {
        name: "Frozen Foods",
        slug: "frozen-foods",
        description: "Frozen vegetables, fruits, and ready-to-cook items",
        sortOrder: 10,
        isActive: true
      },
      {
        name: "Personal Care",
        slug: "personal-care",
        description: "Soaps, shampoos, toothpaste, and hygiene products",
        sortOrder: 11,
        isActive: true
      },
      {
        name: "Household Essentials",
        slug: "household-essentials",
        description: "Cleaning supplies, detergents, and household items",
        sortOrder: 12,
        isActive: true
      },
      {
        name: "Baby Care",
        slug: "baby-care",
        description: "Baby food, diapers, and baby care products",
        sortOrder: 13,
        isActive: true
      },
      {
        name: "Pet Supplies",
        slug: "pet-supplies",
        description: "Pet food, treats, and pet care products",
        sortOrder: 14,
        isActive: true
      },
      {
        name: "Organic & Natural",
        slug: "organic-natural",
        description: "Organic fruits, vegetables, and natural products",
        sortOrder: 15,
        isActive: true
      },
      {
        name: "International Foods",
        slug: "international-foods",
        description: "Imported foods and international cuisine ingredients",
        sortOrder: 16,
        isActive: true
      },
      {
        name: "Health & Wellness",
        slug: "health-wellness",
        description: "Health supplements, vitamins, and wellness products",
        sortOrder: 17,
        isActive: true
      },
      {
        name: "Seasonal Items",
        slug: "seasonal-items",
        description: "Festival-specific foods and seasonal products",
        sortOrder: 18,
        isActive: true
      }
    ];

    let createdCount = 0;
    let updatedCount = 0;

    // Upsert each category
    for (const categoryData of categories) {
      const result = await prisma.category.upsert({
        where: { slug: categoryData.slug },
        update: {
          name: categoryData.name,
          description: categoryData.description,
          sortOrder: categoryData.sortOrder,
          isActive: categoryData.isActive,
          updatedAt: new Date()
        },
        create: {
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description,
          sortOrder: categoryData.sortOrder,
          isActive: categoryData.isActive
        }
      });

      if (result.createdAt.getTime() === result.updatedAt.getTime()) {
        createdCount++;
        console.log(`✅ Created category: ${categoryData.name}`);
      } else {
        updatedCount++;
        console.log(`🔄 Updated category: ${categoryData.name}`);
      }
    }

    console.log(`\n🎉 Category seeding completed successfully!`);
    console.log(`📊 Created: ${createdCount} | Updated: ${updatedCount} | Total: ${categories.length}`);

    // Display all categories
    const allCategories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' }
    });

    console.log(`\n📋 All Categories:`);
    allCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} (${cat.slug}) - ${cat.isActive ? '✅ Active' : '❌ Inactive'}`);
    });

  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    throw error;
  }
}

// Standalone execution
if (require.main === module) {
  seedCategories()
    .then(() => {
      console.log("✅ Categories seeded successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Failed to seed categories:", error);
      process.exit(1);
    });
} 