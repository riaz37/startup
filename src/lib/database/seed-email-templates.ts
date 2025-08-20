import { prisma } from "./prisma";

const defaultTemplates = [
  {
    name: "Welcome Email",
    subject: "Welcome to Sohozdaam!",
    content: `
      <h2>👋 Welcome to Sohozdaam!</h2>
      <p>Hi <strong>{{userName}}</strong>,</p>
      <p>Welcome to Sohozdaam - where group buying makes everything more affordable! We're thrilled to have you join our community of smart shoppers. 🎉</p>
      
      <div class="order-details">
          <h3>🚀 What You Can Do</h3>
          <ul style="list-style: none; padding: 0;">
              <li style="margin-bottom: 12px; padding-left: 0;">🎯 <strong>Join group orders</strong> and save money on groceries</li>
              <li style="margin-bottom: 12px; padding-left: 0;">📱 <strong>Track your orders</strong> in real-time</li>
              <li style="margin-bottom: 12px; padding-left: 0;">📍 <strong>Manage delivery addresses</strong> easily</li>
              <li style="margin-bottom: 12px; padding-left: 0;">🔔 <strong>Get notified</strong> about new group orders</li>
          </ul>
      </div>
      
      {{#if verificationUrl}}
      <div class="cta-section">
          <p style="margin-bottom: 16px; color: #374151;"><strong>Please verify your email address to complete your registration:</strong></p>
          <a href="{{verificationUrl}}" class="button">Verify Email</a>
      </div>
      {{/if}}
      
      <p style="text-align: center; color: #10b981; font-weight: 600;">Happy shopping and happy saving! 🛒✨</p>
    `,
    variables: ["userName", "verificationUrl"],
    category: "WELCOME" as const,
    isActive: true
  },
  {
    name: "Order Confirmation",
    subject: "Order Confirmed - #{{orderNumber}}",
    content: `
      <h2>🎉 Order Confirmed!</h2>
      <p>Hi <strong>{{userName}}</strong>,</p>
      <p>Great news! Your order has been confirmed and payment processed successfully. We're excited to get your items ready for you!</p>
      
      <div class="order-details">
          <h3>📋 Order Details</h3>
          <p><strong>Order Number:</strong> <span style="color: #10b981; font-weight: 700;">#{{orderNumber}}</span></p>
          <p><strong>Product:</strong> {{productName}}</p>
          <p><strong>Quantity:</strong> {{quantity}} {{unit}}</p>
          <p><strong>Total Amount:</strong> <span class="price">{{totalAmount}}</span></p>
          <p><strong>Delivery Address:</strong> {{deliveryAddress}}</p>
          <p><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>
          <div style="text-align: center; margin-top: 16px;">
              <span class="status-badge">✅ Confirmed</span>
          </div>
      </div>
      
      <p>We'll keep you updated on your order status every step of the way. You can track your order anytime from your dashboard.</p>
      
      <div class="cta-section">
          <a href="{{orderUrl}}" class="button">View Order Details</a>
      </div>
      
      <p style="text-align: center; color: #10b981; font-weight: 600;">Thank you for choosing Sohozdaam! 🚀</p>
    `,
    variables: ["userName", "orderNumber", "productName", "quantity", "unit", "totalAmount", "deliveryAddress", "estimatedDelivery", "orderUrl"],
    category: "ORDER_CONFIRMATION" as const,
    isActive: true
  },
  {
    name: "Payment Success",
    subject: "Payment Successful - Order #{{orderNumber}}",
    content: `
      <h2>💳 Payment Successful!</h2>
      <p>Hi <strong>{{userName}}</strong>,</p>
      <p>Your payment has been processed successfully and your order is now being prepared!</p>
      
      <div class="order-details">
          <h3>💰 Payment Details</h3>
          <p><strong>Order Number:</strong> <span style="color: #10b981; font-weight: 700;">#{{orderNumber}}</span></p>
          <p><strong>Amount Paid:</strong> <span class="price">{{amount}}</span></p>
          <p><strong>Payment Method:</strong> {{paymentMethod}}</p>
          <div style="text-align: center; margin-top: 16px;">
              <span class="status-badge">✅ Paid</span>
          </div>
      </div>
      
      <p>Your order is now being processed and will be ready for pickup or delivery soon. We'll notify you at every step!</p>
      
      <div class="cta-section">
          <a href="{{orderUrl}}" class="button">View Order</a>
      </div>
    `,
    variables: ["userName", "orderNumber", "amount", "paymentMethod", "orderUrl"],
    category: "PAYMENT_SUCCESS" as const,
    isActive: true
  },
  {
    name: "Group Order Threshold Met",
    subject: "Group Order Threshold Met - {{productName}}",
    content: `
      <h2>🎯 Group Order Threshold Met!</h2>
      <p>Hi <strong>{{userName}}</strong>,</p>
      <p>Exciting news! The group order you joined has reached its minimum threshold and is now being processed. This means better prices for everyone! 🎉</p>
      
      <div class="order-details">
          <h3>🚀 Group Order Details</h3>
          <p><strong>Product:</strong> {{productName}}</p>
          <p><strong>Batch Number:</strong> <span style="color: #10b981; font-weight: 700;">#{{batchNumber}}</span></p>
          <p><strong>Progress:</strong> {{currentQuantity}}/{{targetQuantity}} ({{progressPercentage}}%)</p>
          <div class="progress-bar">
              <div class="progress-fill" style="width: {{progressPercentage}}%"></div>
          </div>
          <p><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>
          <div style="text-align: center; margin-top: 16px;">
              <span class="status-badge processing">🚀 Processing</span>
          </div>
      </div>
      
      <p>We're now placing the order with our supplier. You'll receive updates as your order progresses through production and shipping.</p>
      
      <div class="cta-section">
          <a href="{{groupOrderUrl}}" class="button">View Group Order</a>
      </div>
    `,
    variables: ["userName", "productName", "batchNumber", "currentQuantity", "targetQuantity", "progressPercentage", "estimatedDelivery", "groupOrderUrl"],
    category: "CUSTOM" as const,
    isActive: true
  },
  {
    name: "Order Shipped",
    subject: "Your Order is on the Way! - #{{orderNumber}}",
    content: `
      <h2>📦 Your Order is on the Way!</h2>
      <p>Hi <strong>{{userName}}</strong>,</p>
      <p>Great news! Your order has been shipped and is now making its way to you. We can't wait for you to receive it! 🚚</p>
      
      <div class="order-details">
          <h3>📋 Shipping Details</h3>
          <p><strong>Order Number:</strong> <span style="color: #10b981; font-weight: 700;">#{{orderNumber}}</span></p>
          <p><strong>Product:</strong> {{productName}}</p>
          {{#if trackingNumber}}
          <p><strong>Tracking Number:</strong> <span style="color: #3b82f6; font-weight: 600;">{{trackingNumber}}</span></p>
          {{/if}}
          <p><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>
          <div style="text-align: center; margin-top: 16px;">
              <span class="status-badge shipped">🚚 Shipped</span>
          </div>
      </div>
      
      <p>We'll notify you once your order is delivered. Thank you for your patience, and we hope you love your purchase!</p>
      
      <div class="cta-section">
          <a href="{{orderUrl}}" class="button">Track Order</a>
      </div>
    `,
    variables: ["userName", "orderNumber", "productName", "trackingNumber", "estimatedDelivery", "orderUrl"],
    category: "SHIPPING_UPDATE" as const,
    isActive: true
  },
  {
    name: "Order Delivered",
    subject: "Your Order Has Been Delivered! - #{{orderNumber}}",
    content: `
      <h2>🎉 Your Order Has Been Delivered!</h2>
      <p>Hi <strong>{{userName}}</strong>,</p>
      <p>Your order has been successfully delivered! We hope you're absolutely thrilled with your purchase and the savings you've achieved! 🎊</p>
      
      <div class="order-details">
          <h3>✅ Delivery Confirmation</h3>
          <p><strong>Order Number:</strong> <span style="color: #10b981; font-weight: 700;">#{{orderNumber}}</span></p>
          <p><strong>Product:</strong> {{productName}}</p>
          <div style="text-align: center; margin-top: 16px;">
              <span class="status-badge">✅ Delivered</span>
          </div>
      </div>
      
      <p>We'd love to hear about your experience! Your feedback helps us improve and helps other customers make informed decisions.</p>
      
      <div class="cta-section">
          <a href="{{orderUrl}}" class="button">Leave Review</a>
      </div>
      
      <p style="text-align: center; color: #10b981; font-weight: 600;">Thank you for choosing Sohozdaam! 🌟</p>
    `,
    variables: ["userName", "orderNumber", "productName", "orderUrl"],
    category: "DELIVERY_CONFIRMATION" as const,
    isActive: true
  },
  {
    name: "Password Reset",
    subject: "Reset Your Password - Sohozdaam",
    content: `
      <h2>🔐 Reset Your Password</h2>
      <p>Hi <strong>{{userName}}</strong>,</p>
      <p>We received a request to reset your password for your Sohozdaam account. Click the button below to create a new, secure password:</p>
      
      <div class="cta-section">
          <a href="{{resetUrl}}" class="button">Reset Password</a>
      </div>
      
      <div class="order-details">
          <h3>⚠️ Security Notice</h3>
          <p><strong>This link will expire in 1 hour</strong> for security reasons.</p>
          <p><strong>If you didn't request this password reset</strong>, please ignore this email and your password will remain unchanged.</p>
      </div>
      
      <p style="text-align: center; color: #6b7280; font-size: 14px;">For your security, this link can only be used once.</p>
    `,
    variables: ["userName", "resetUrl"],
    category: "CUSTOM" as const,
    isActive: true
  },
  {
    name: "Price Alert",
    subject: "Price Drop Alert - {{productName}}",
    content: `
      <h2>Price Drop Alert! 🎉</h2>
      <p>Hi {{userName}},</p>
      <p>Great news! The price of {{productName}} has dropped!</p>
      <p><strong>Price Update:</strong></p>
      <ul>
          <li>Old Price: {{oldPrice}}</li>
          <li>New Price: {{newPrice}}</li>
          <li>Savings: {{savings}}</li>
          <li>Valid Until: {{validUntil}}</li>
      </ul>
      <p>Don't miss out on this great deal!</p>
      <p><a href="{{productUrl}}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Product</a></p>
    `,
    variables: ["userName", "productName", "oldPrice", "newPrice", "savings", "validUntil", "productUrl"],
    category: "PRICE_ALERT" as const,
    isActive: true
  }
];

export async function seedEmailTemplates() {
  try {
    console.log("📧 Seeding email templates...");
    
    // Get the first admin user to use as creator
    const adminUser = await prisma.user.findFirst({
      where: {
        role: {
          in: ["ADMIN", "SUPER_ADMIN"]
        }
      }
    });

    if (!adminUser) {
      console.log("⚠️  No admin user found. Skipping email template seeding.");
      return;
    }

    let createdCount = 0;
    let skippedCount = 0;

    for (const template of defaultTemplates) {
      try {
        const existingTemplate = await prisma.emailTemplate.findUnique({
          where: { name: template.name }
        });

        if (existingTemplate) {
          console.log(`   ⏭️  Template "${template.name}" already exists, skipping...`);
          skippedCount++;
          continue;
        }

        await prisma.emailTemplate.create({
          data: {
            ...template,
            createdBy: adminUser.id
          }
        });

        console.log(`   ✅ Created template: "${template.name}"`);
        createdCount++;
      } catch (error) {
        console.error(`   ❌ Failed to create template "${template.name}":`, error);
      }
    }

    console.log(`\n📊 Email Templates Seeding Summary:`);
    console.log(`   Created: ${createdCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log(`   Total: ${createdCount + skippedCount}`);

  } catch (error) {
    console.error("❌ Error seeding email templates:", error);
    throw error;
  }
}

// Standalone execution
if (require.main === module) {
  seedEmailTemplates()
    .then(() => {
      console.log("✅ Email templates seeded successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Failed to seed email templates:", error);
      process.exit(1);
    });
} 