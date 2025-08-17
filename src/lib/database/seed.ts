import { prisma } from "./prisma";
import { seedCategories } from "./seed-categories";
import { seedProducts } from "./seed-products";

export async function seedDatabase() {
  try {
    console.log("🚀 Starting database seeding...\n");

    // Step 1: Seed categories first
    console.log("📂 Step 1: Seeding categories...");
    await seedCategories();
    console.log("");

    // Step 2: Seed products (which depend on categories)
    console.log("📦 Step 2: Seeding products...");
    await seedProducts();
    console.log("");

    console.log("🎉 Database seeding completed successfully!");
    
    // Display final summary
    const categoryCount = await prisma.category.count();
    const productCount = await prisma.product.count();
    
    console.log(`\n📊 Final Database State:`);
    console.log(`   Categories: ${categoryCount}`);
    console.log(`   Products: ${productCount}`);

  } catch (error) {
    console.error("❌ Error during database seeding:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Standalone execution
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("✅ Database seeded successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Failed to seed database:", error);
      process.exit(1);
    });
} 