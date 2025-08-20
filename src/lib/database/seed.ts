import { prisma } from "./prisma";
import { seedCategories } from "./seed-categories";
import { seedGroupOrders } from "./seed-group-orders";
import { seedProducts } from "./seed-products";
import { seedEmailTemplates } from "./seed-email-templates";

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

    // Step 3: Seed group orders (which depend on products)
    console.log("🎉 Step 3: Seeding group orders...");
    await seedGroupOrders();
    console.log("");

    // Step 4: Seed email templates
    console.log("📧 Step 4: Seeding email templates...");
    await seedEmailTemplates();
    console.log("");

    console.log("🎉 Database seeding completed successfully!");
    
    // Display final summary
    const categoryCount = await prisma.category.count();
    const productCount = await prisma.product.count();
    const templateCount = await prisma.emailTemplate.count();
    
    console.log(`\n📊 Final Database State:`);
    console.log(`   Categories: ${categoryCount}`);
    console.log(`   Products: ${productCount}`);
    console.log(`   Email Templates: ${templateCount}`);

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