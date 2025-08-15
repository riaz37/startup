import nodemailer from 'nodemailer';
import { 
  createVerificationEmailTemplate, 
  createPasswordResetEmailTemplate, 
  createWelcomeEmailTemplate 
} from './email-templates';

// Create transporter
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: process.env.EMAIL_SERVER_PORT === '465',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendVerificationEmail(email: string, token: string, userName?: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;
  
  const mailOptions = {
    from: `"Sohozdaam Team" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: '✉️ Verify your email address - Sohozdaam',
    html: createVerificationEmailTemplate(verificationUrl, userName),
    // Fallback text version
    text: `
Welcome to Sohozdaam${userName ? `, ${userName}` : ''}!

Thank you for signing up. Please verify your email address by visiting this link:
${verificationUrl}

This link will expire in 24 hours for your security.

If you didn't create an account, please ignore this email.

Best regards,
The Sohozdaam Team
    `.trim(),
  };

  await transporter.sendMail(mailOptions);
}

export async function sendPasswordResetEmail(email: string, token: string, userName?: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
  
  const mailOptions = {
    from: `"Sohozdaam Security" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: '🔐 Reset your password - Sohozdaam',
    html: createPasswordResetEmailTemplate(resetUrl, userName),
    // Fallback text version
    text: `
Password Reset Request

${userName ? `Hi ${userName}, ` : ''}We received a request to reset your password for your Sohozdaam account.

Please visit this link to create a new password:
${resetUrl}

This link will expire in 1 hour for your security.

If you didn't request this reset, please ignore this email. Your password will remain unchanged.

Best regards,
The Sohozdaam Team
    `.trim(),
  };

  await transporter.sendMail(mailOptions);
}

export async function sendWelcomeEmail(email: string, name: string) {
  const dashboardUrl = `${process.env.NEXTAUTH_URL}/dashboard`;
  
  const mailOptions = {
    from: `"Sohozdaam Team" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: '🎉 Welcome to Sohozdaam - Let\'s get started!',
    html: createWelcomeEmailTemplate(dashboardUrl, name),
    // Fallback text version
    text: `
Welcome aboard, ${name}!

Your email has been verified successfully! You're now part of the Sohozdaam community and can start saving money through our group ordering platform.

Visit your dashboard: ${dashboardUrl}

Getting Started:
1. Browse available group orders
2. Join orders that interest you  
3. Save money with bulk pricing

Need help? Visit our help center: ${process.env.NEXTAUTH_URL}/help

Thank you for choosing Sohozdaam!

Best regards,
The Sohozdaam Team
    `.trim(),
  };

  await transporter.sendMail(mailOptions);
}

// Additional email templates for future use
export async function sendOrderConfirmationEmail(
  email: string, 
  userName: string, 
  orderDetails: {
    orderNumber: string;
    productName: string;
    quantity: number;
    totalAmount: number;
    estimatedDelivery?: string;
  }
) {
  const mailOptions = {
    from: `"Sohozdaam Orders" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `🛒 Order Confirmed #${orderDetails.orderNumber} - Sohozdaam`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: 'Inter', sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
            <div style="font-size: 28px; font-weight: 700; color: #ffffff; margin-bottom: 8px;">Sohozdaam</div>
            <div style="color: #d1fae5; font-size: 14px;">Order Confirmation</div>
          </div>
          
          <!-- Body -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #111827; font-size: 24px; margin-bottom: 16px; text-align: center;">
              Order Confirmed! 🎉
            </h2>
            
            <p style="color: #6b7280; font-size: 16px; text-align: center; margin-bottom: 32px;">
              Hi ${userName}, your order has been confirmed and is being processed.
            </p>
            
            <!-- Order Details -->
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin: 24px 0;">
              <h3 style="color: #374151; font-size: 18px; margin-bottom: 16px;">Order Details</h3>
              <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 12px;">
                <strong>Order Number:</strong> #${orderDetails.orderNumber}
              </div>
              <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 12px;">
                <strong>Product:</strong> ${orderDetails.productName}
              </div>
              <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 12px;">
                <strong>Quantity:</strong> ${orderDetails.quantity}
              </div>
              <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 12px;">
                <strong>Total Amount:</strong> ₹${orderDetails.totalAmount.toFixed(2)}
              </div>
              ${orderDetails.estimatedDelivery ? `
              <div>
                <strong>Estimated Delivery:</strong> ${orderDetails.estimatedDelivery}
              </div>
              ` : ''}
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${process.env.NEXTAUTH_URL}/orders/${orderDetails.orderNumber}" 
                 style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600;">
                Track Your Order
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">
              © ${new Date().getFullYear()} Sohozdaam. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Order Confirmed!

Hi ${userName}, your order has been confirmed and is being processed.

Order Details:
- Order Number: #${orderDetails.orderNumber}
- Product: ${orderDetails.productName}
- Quantity: ${orderDetails.quantity}
- Total Amount: ₹${orderDetails.totalAmount.toFixed(2)}
${orderDetails.estimatedDelivery ? `- Estimated Delivery: ${orderDetails.estimatedDelivery}` : ''}

Track your order: ${process.env.NEXTAUTH_URL}/orders/${orderDetails.orderNumber}

Thank you for choosing Sohozdaam!
    `.trim(),
  };

  await transporter.sendMail(mailOptions);
}       <p>Your email has been verified successfully. You can now start using all features of Sohozdaam.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/dashboard" 
             style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          If you have any questions, feel free to contact our support team.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}