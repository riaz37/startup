import { formatPrice } from "./utils";

// Base email template
const baseTemplate = (content: string, title: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .button { display: inline-block; background: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .order-details { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .status-badge { display: inline-block; background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .price { font-size: 24px; font-weight: bold; color: #0f172a; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛒 Sohozdaam</h1>
            <p>Group Buying Made Simple</p>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>© 2024 Sohozdaam. All rights reserved.</p>
            <p>If you have any questions, contact us at support@sohozdaam.com</p>
        </div>
    </div>
</body>
</html>
`;

// Order confirmation email
export const orderConfirmationTemplate = (data: {
  userName: string;
  orderNumber: string;
  productName: string;
  quantity: number;
  unit: string;
  totalAmount: number;
  deliveryAddress: string;
  estimatedDelivery: string;
  orderId: string;
}) => {
  const content = `
    <h2>🎉 Order Confirmed!</h2>
    <p>Hi ${data.userName},</p>
    <p>Great news! Your order has been confirmed and payment processed successfully.</p>
    
    <div class="order-details">
        <h3>Order Details</h3>
        <p><strong>Order Number:</strong> ${data.orderNumber}</p>
        <p><strong>Product:</strong> ${data.productName}</p>
        <p><strong>Quantity:</strong> ${data.quantity} ${data.unit}</p>
        <p><strong>Total Amount:</strong> <span class="price">${formatPrice(data.totalAmount)}</span></p>
        <p><strong>Delivery Address:</strong> ${data.deliveryAddress}</p>
        <p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>
        <span class="status-badge">✅ Confirmed</span>
    </div>
    
    <p>We'll keep you updated on your order status. You can track your order anytime from your dashboard.</p>
    
    <a href="${process.env.NEXTAUTH_URL}/orders/${data.orderId}" class="button">View Order Details</a>
    
    <p>Thank you for choosing Sohozdaam!</p>
  `;
  
  return baseTemplate(content, "Order Confirmed - Sohozdaam");
};

// Payment success email
export const paymentSuccessTemplate = (data: {
  userName: string;
  orderNumber: string;
  amount: number;
  paymentMethod: string;
  orderId: string;
}) => {
  const content = `
    <h2>💳 Payment Successful!</h2>
    <p>Hi ${data.userName},</p>
    <p>Your payment has been processed successfully.</p>
    
    <div class="order-details">
        <h3>Payment Details</h3>
        <p><strong>Order Number:</strong> ${data.orderNumber}</p>
        <p><strong>Amount Paid:</strong> <span class="price">${formatPrice(data.amount)}</span></p>
        <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
        <span class="status-badge">✅ Paid</span>
    </div>
    
    <p>Your order is now being processed. We'll notify you when it's ready for pickup or delivery.</p>
    
    <a href="${process.env.NEXTAUTH_URL}/orders/${data.orderId}" class="button">View Order</a>
  `;
  
  return baseTemplate(content, "Payment Successful - Sohozdaam");
};

// Group order threshold met email
export const groupOrderThresholdMetTemplate = (data: {
  userName: string;
  productName: string;
  batchNumber: string;
  currentQuantity: number;
  targetQuantity: number;
  estimatedDelivery: string;
  groupOrderId: string;
}) => {
  const progress = Math.round((data.currentQuantity / data.targetQuantity) * 100);
  
  const content = `
    <h2>🎯 Group Order Threshold Met!</h2>
    <p>Hi ${data.userName},</p>
    <p>Exciting news! The group order you joined has reached its minimum threshold and is now being processed.</p>
    
    <div class="order-details">
        <h3>Group Order Details</h3>
        <p><strong>Product:</strong> ${data.productName}</p>
        <p><strong>Batch Number:</strong> ${data.batchNumber}</p>
        <p><strong>Progress:</strong> ${data.currentQuantity}/${data.targetQuantity} (${progress}%)</p>
        <p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>
        <span class="status-badge">🚀 Processing</span>
    </div>
    
    <p>We're now placing the order with our supplier. You'll receive updates as your order progresses.</p>
    
    <a href="${process.env.NEXTAUTH_URL}/group-orders/${data.groupOrderId}" class="button">View Group Order</a>
  `;
  
  return baseTemplate(content, "Group Order Threshold Met - Sohozdaam");
};

// Order shipped email
export const orderShippedTemplate = (data: {
  userName: string;
  orderNumber: string;
  productName: string;
  trackingNumber?: string;
  estimatedDelivery: string;
  orderId: string;
}) => {
  const content = `
    <h2>📦 Your Order is on the Way!</h2>
    <p>Hi ${data.userName},</p>
    <p>Great news! Your order has been shipped and is on its way to you.</p>
    
    <div class="order-details">
        <h3>Shipping Details</h3>
        <p><strong>Order Number:</strong> ${data.orderNumber}</p>
        <p><strong>Product:</strong> ${data.productName}</p>
        ${data.trackingNumber ? `<p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>` : ''}
        <p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>
        <span class="status-badge">🚚 Shipped</span>
    </div>
    
    <p>We'll notify you once your order is delivered. Thank you for your patience!</p>
    
    <a href="${process.env.NEXTAUTH_URL}/orders/${data.orderId}" class="button">Track Order</a>
  `;
  
  return baseTemplate(content, "Order Shipped - Sohozdaam");
};

// Order delivered email
export const orderDeliveredTemplate = (data: {
  userName: string;
  orderNumber: string;
  productName: string;
  orderId: string;
}) => {
  const content = `
    <h2>🎉 Your Order Has Been Delivered!</h2>
    <p>Hi ${data.userName},</p>
    <p>Your order has been successfully delivered. We hope you're happy with your purchase!</p>
    
    <div class="order-details">
        <h3>Delivery Confirmation</h3>
        <p><strong>Order Number:</strong> ${data.orderNumber}</p>
        <p><strong>Product:</strong> ${data.productName}</p>
        <span class="status-badge">✅ Delivered</span>
    </div>
    
    <p>We'd love to hear your feedback! Please take a moment to review your experience.</p>
    
    <a href="${process.env.NEXTAUTH_URL}/orders/${data.orderId}" class="button">Leave Review</a>
    
    <p>Thank you for choosing Sohozdaam!</p>
  `;
  
  return baseTemplate(content, "Order Delivered - Sohozdaam");
};

// Welcome email
export const welcomeEmailTemplate = (data: {
  userName: string;
  verificationUrl?: string;
}) => {
  const content = `
    <h2>👋 Welcome to Sohozdaam!</h2>
    <p>Hi ${data.userName},</p>
    <p>Welcome to Sohozdaam - where group buying makes everything more affordable!</p>
    
    <p>Here's what you can do with your account:</p>
    <ul>
        <li>Join group orders and save money on groceries</li>
        <li>Track your orders in real-time</li>
        <li>Manage your delivery addresses</li>
        <li>Get notified about new group orders</li>
    </ul>
    
    ${data.verificationUrl ? `
    <p>Please verify your email address to complete your registration:</p>
    <a href="${data.verificationUrl}" class="button">Verify Email</a>
    ` : ''}
    
    <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Go to Dashboard</a>
    
    <p>Happy shopping!</p>
  `;
  
  return baseTemplate(content, "Welcome to Sohozdaam");
};

// Password reset email
export const passwordResetTemplate = (data: {
  userName: string;
  resetUrl: string;
}) => {
  const content = `
    <h2>🔐 Reset Your Password</h2>
    <p>Hi ${data.userName},</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    
    <a href="${data.resetUrl}" class="button">Reset Password</a>
    
    <p>This link will expire in 1 hour for security reasons.</p>
    <p>If you didn't request this password reset, please ignore this email.</p>
  `;
  
  return baseTemplate(content, "Reset Your Password - Sohozdaam");
};