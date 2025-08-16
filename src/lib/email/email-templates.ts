import { formatPrice } from "../utils";

// Base email template with modern Sohozdaam theme
const baseTemplate = (content: string, title: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #1f2937; 
            background-color: #f9fafb;
            margin: 0;
            padding: 20px 0;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        .header { 
            background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
            position: relative;
            overflow: hidden;
        }
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
        }
        .logo { 
            font-size: 32px; 
            font-weight: 800; 
            margin-bottom: 8px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .tagline { 
            color: #d1fae5; 
            font-size: 16px; 
            font-weight: 500;
            opacity: 0.9;
        }
        .content { 
            background: #ffffff; 
            padding: 40px 30px; 
            color: #374151;
        }
        .content h2 {
            color: #111827;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 20px;
            text-align: center;
        }
        .content p {
            font-size: 16px;
            margin-bottom: 16px;
            color: #6b7280;
        }
        .content ul {
            margin: 20px 0;
            padding-left: 20px;
        }
        .content li {
            margin-bottom: 8px;
            color: #6b7280;
        }
        .button { 
            display: inline-block; 
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white; 
            padding: 16px 32px; 
            text-decoration: none; 
            border-radius: 12px; 
            margin: 20px 0; 
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
        }
        .button.secondary {
            background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
            box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
        }
        .button.secondary:hover {
            box-shadow: 0 8px 20px rgba(107, 114, 128, 0.4);
        }
        .footer { 
            text-align: center; 
            margin-top: 40px; 
            color: #9ca3af; 
            font-size: 14px;
            padding: 30px;
            background: #f9fafb;
            border-top: 1px solid #e5e7eb;
        }
        .order-details { 
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); 
            padding: 24px; 
            border-radius: 12px; 
            margin: 24px 0; 
            border: 1px solid #e2e8f0;
        }
        .order-details h3 {
            color: #1e293b;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 8px;
        }
        .order-details p {
            margin-bottom: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .order-details strong {
            color: #374151;
            font-weight: 600;
        }
        .status-badge { 
            display: inline-block; 
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white; 
            padding: 8px 16px; 
            border-radius: 20px; 
            font-size: 12px; 
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }
        .status-badge.processing {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
        }
        .status-badge.shipped {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }
        .price { 
            font-size: 24px; 
            font-weight: 700; 
            color: #10b981;
            text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .progress-bar {
            background: #e5e7eb;
            border-radius: 10px;
            height: 8px;
            margin: 12px 0;
            overflow: hidden;
        }
        .progress-fill {
            background: linear-gradient(90deg, #10b981 0%, #059669 100%);
            height: 100%;
            border-radius: 10px;
            transition: width 0.3s ease;
        }
        .cta-section {
            text-align: center;
            margin: 32px 0;
            padding: 24px;
            background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
            border-radius: 12px;
            border: 1px solid #d1fae5;
        }
        .icon {
            font-size: 24px;
            margin-right: 8px;
        }
        @media (max-width: 600px) {
            .container { margin: 10px; border-radius: 12px; }
            .header, .content { padding: 24px 20px; }
            .logo { font-size: 28px; }
            .content h2 { font-size: 24px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🛒 Sohozdaam</div>
            <div class="tagline">Group Buying Made Simple</div>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>© 2024 Sohozdaam. All rights reserved.</p>
            <p>Questions? Contact us at <a href="mailto:support@sohozdaam.com" style="color: #10b981; text-decoration: none;">support@sohozdaam.com</a></p>
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
    <p>Hi <strong>${data.userName}</strong>,</p>
    <p>Great news! Your order has been confirmed and payment processed successfully. We're excited to get your items ready for you!</p>
    
    <div class="order-details">
        <h3>📋 Order Details</h3>
        <p><strong>Order Number:</strong> <span style="color: #10b981; font-weight: 700;">#${
          data.orderNumber
        }</span></p>
        <p><strong>Product:</strong> ${data.productName}</p>
        <p><strong>Quantity:</strong> ${data.quantity} ${data.unit}</p>
        <p><strong>Total Amount:</strong> <span class="price">${formatPrice(
          data.totalAmount
        )}</span></p>
        <p><strong>Delivery Address:</strong> ${data.deliveryAddress}</p>
        <p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>
        <div style="text-align: center; margin-top: 16px;">
            <span class="status-badge">✅ Confirmed</span>
        </div>
    </div>
    
    <p>We'll keep you updated on your order status every step of the way. You can track your order anytime from your dashboard.</p>
    
    <div class="cta-section">
        <a href="${process.env.NEXTAUTH_URL}/orders/${
    data.orderId
  }" class="button">View Order Details</a>
    </div>
    
    <p style="text-align: center; color: #10b981; font-weight: 600;">Thank you for choosing Sohozdaam! 🚀</p>
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
    <p>Hi <strong>${data.userName}</strong>,</p>
    <p>Your payment has been processed successfully and your order is now being prepared!</p>
    
    <div class="order-details">
        <h3>💰 Payment Details</h3>
        <p><strong>Order Number:</strong> <span style="color: #10b981; font-weight: 700;">#${
          data.orderNumber
        }</span></p>
        <p><strong>Amount Paid:</strong> <span class="price">${formatPrice(
          data.amount
        )}</span></p>
        <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
        <div style="text-align: center; margin-top: 16px;">
            <span class="status-badge">✅ Paid</span>
        </div>
    </div>
    
    <p>Your order is now being processed and will be ready for pickup or delivery soon. We'll notify you at every step!</p>
    
    <div class="cta-section">
        <a href="${process.env.NEXTAUTH_URL}/orders/${
    data.orderId
  }" class="button">View Order</a>
    </div>
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
  const progress = Math.round(
    (data.currentQuantity / data.targetQuantity) * 100
  );

  const content = `
    <h2>🎯 Group Order Threshold Met!</h2>
    <p>Hi <strong>${data.userName}</strong>,</p>
    <p>Exciting news! The group order you joined has reached its minimum threshold and is now being processed. This means better prices for everyone! 🎉</p>
    
    <div class="order-details">
        <h3>🚀 Group Order Details</h3>
        <p><strong>Product:</strong> ${data.productName}</p>
        <p><strong>Batch Number:</strong> <span style="color: #10b981; font-weight: 700;">#${data.batchNumber}</span></p>
        <p><strong>Progress:</strong> ${data.currentQuantity}/${data.targetQuantity} (${progress}%)</p>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>
        <div style="text-align: center; margin-top: 16px;">
            <span class="status-badge processing">🚀 Processing</span>
        </div>
    </div>
    
    <p>We're now placing the order with our supplier. You'll receive updates as your order progresses through production and shipping.</p>
    
    <div class="cta-section">
        <a href="${process.env.NEXTAUTH_URL}/group-orders/${data.groupOrderId}" class="button">View Group Order</a>
    </div>
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
    <p>Hi <strong>${data.userName}</strong>,</p>
    <p>Great news! Your order has been shipped and is now making its way to you. We can't wait for you to receive it! 🚚</p>
    
    <div class="order-details">
        <h3>📋 Shipping Details</h3>
        <p><strong>Order Number:</strong> <span style="color: #10b981; font-weight: 700;">#${
          data.orderNumber
        }</span></p>
        <p><strong>Product:</strong> ${data.productName}</p>
        ${
          data.trackingNumber
            ? `<p><strong>Tracking Number:</strong> <span style="color: #3b82f6; font-weight: 600;">${data.trackingNumber}</span></p>`
            : ""
        }
        <p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>
        <div style="text-align: center; margin-top: 16px;">
            <span class="status-badge shipped">🚚 Shipped</span>
        </div>
    </div>
    
    <p>We'll notify you once your order is delivered. Thank you for your patience, and we hope you love your purchase!</p>
    
    <div class="cta-section">
        <a href="${process.env.NEXTAUTH_URL}/orders/${
    data.orderId
  }" class="button">Track Order</a>
    </div>
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
    <p>Hi <strong>${data.userName}</strong>,</p>
    <p>Your order has been successfully delivered! We hope you're absolutely thrilled with your purchase and the savings you've achieved! 🎊</p>
    
    <div class="order-details">
        <h3>✅ Delivery Confirmation</h3>
        <p><strong>Order Number:</strong> <span style="color: #10b981; font-weight: 700;">#${data.orderNumber}</span></p>
        <p><strong>Product:</strong> ${data.productName}</p>
        <div style="text-align: center; margin-top: 16px;">
            <span class="status-badge">✅ Delivered</span>
        </div>
    </div>
    
    <p>We'd love to hear about your experience! Your feedback helps us improve and helps other customers make informed decisions.</p>
    
    <div class="cta-section">
        <a href="${process.env.NEXTAUTH_URL}/orders/${data.orderId}" class="button">Leave Review</a>
    </div>
    
    <p style="text-align: center; color: #10b981; font-weight: 600;">Thank you for choosing Sohozdaam! 🌟</p>
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
    <p>Hi <strong>${data.userName}</strong>,</p>
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
    
    ${
      data.verificationUrl
        ? `
    <div class="cta-section">
        <p style="margin-bottom: 16px; color: #374151;"><strong>Please verify your email address to complete your registration:</strong></p>
        <a href="${data.verificationUrl}" class="button">Verify Email</a>
    </div>
    `
        : ""
    }
    
   
    <p style="text-align: center; color: #10b981; font-weight: 600;">Happy shopping and happy saving! 🛒✨</p>
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
    <p>Hi <strong>${data.userName}</strong>,</p>
    <p>We received a request to reset your password for your Sohozdaam account. Click the button below to create a new, secure password:</p>
    
    <div class="cta-section">
        <a href="${data.resetUrl}" class="button">Reset Password</a>
    </div>
    
    <div class="order-details">
        <h3>⚠️ Security Notice</h3>
        <p><strong>This link will expire in 1 hour</strong> for security reasons.</p>
        <p><strong>If you didn't request this password reset</strong>, please ignore this email and your password will remain unchanged.</p>
    </div>
    
    <p style="text-align: center; color: #6b7280; font-size: 14px;">For your security, this link can only be used once.</p>
  `;

  return baseTemplate(content, "Reset Your Password - Sohozdaam");
};
