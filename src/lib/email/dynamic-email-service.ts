import nodemailer from "nodemailer";
import { prisma } from "@/lib/database";
import { EmailTemplate } from "@/types";

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: parseInt(process.env.SMTP_PORT || "465") === 465, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Template rendering function
function renderTemplate(template: { content: string }, variables: Record<string, string | number | boolean | undefined>): string {
  let content = template.content;
  
  // Replace variables in the template
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    content = content.replace(regex, value?.toString() || '');
  });
  
  // Handle conditional blocks (simple Handlebars-like syntax)
  content = content.replace(/\{\{#if\s+(\w+)\}\}(.*?)\{\{\/if\}/g, (match, condition, content) => {
    return variables[condition] ? content : '';
  });
  
  return content;
}

// Dynamic email service class
export class DynamicEmailService {
  private static instance: DynamicEmailService;

  private constructor() {}

  public static getInstance(): DynamicEmailService {
    if (!DynamicEmailService.instance) {
      DynamicEmailService.instance = new DynamicEmailService();
    }
    return DynamicEmailService.instance;
  }

  // Send email with database tracking
  private async sendEmailWithTracking(
    to: string,
    subject: string,
    html: string,
    templateId: string,
    userId?: string,
    campaignId?: string
  ) {
    let delivery;
    try {
      // Create delivery record in database
      delivery = await prisma.emailDelivery.create({
        data: {
          to,
          subject,
          content: html,
          status: 'PENDING',
          templateId,
          userId,
          campaignId,
          retryCount: 0,
          maxRetries: 3,
        },
      });

      // Send email
      const info = await transporter.sendMail({
        from: `"Sohozdaam" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        headers: {
          'X-Email-ID': delivery.id,
          'X-Template': templateId,
        },
      });

      // Update delivery status to sent
      await prisma.emailDelivery.update({
        where: { id: delivery.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      console.log(`Email sent successfully: ${delivery.id} to ${to}`);
      return { success: true, emailId: delivery.id, messageId: info.messageId };
    } catch (error) {
      // Update delivery status to failed
      if (delivery) {
        await prisma.emailDelivery.update({
          where: { id: delivery.id },
          data: {
            status: 'FAILED',
            failedAt: new Date(),
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }

      console.error(`Email failed to send: ${delivery?.id || 'unknown'} to ${to}`, error);
      return { success: false, emailId: delivery?.id, error };
    }
  }

  // Send email using template name and variables
  async sendEmailWithTemplate(
    templateName: string,
    variables: Record<string, string | number | boolean | undefined>,
    to: string,
    userId?: string,
    campaignId?: string
  ) {
    try {
      // Fetch template from database
      const template = await prisma.emailTemplate.findUnique({
        where: { name: templateName, isActive: true }
      });

      if (!template) {
        throw new Error(`Template "${templateName}" not found or inactive`);
      }

      // Render template with variables
      const html = renderTemplate(template, variables);
      
      // Send email
      const result = await this.sendEmailWithTracking(
        to,
        template.subject,
        html,
        template.id,
        userId,
        campaignId
      );

      if (result.success) {
        console.log(`Email sent using template "${templateName}" to ${to}`);
      }
      
      return result;
    } catch (error) {
      console.error(`Error sending email with template "${templateName}":`, error);
      return { success: false, error };
    }
  }

  // Send welcome email using dynamic template
  async sendWelcomeEmail(data: {
    to: string;
    userName: string;
    verificationUrl?: string;
    userId?: string;
  }) {
    return this.sendEmailWithTemplate(
      'Welcome Email',
      {
        userName: data.userName,
        verificationUrl: data.verificationUrl
      },
      data.to,
      data.userId
    );
  }

  // Send order confirmation email using dynamic template
  async sendOrderConfirmation(data: {
    to: string;
    userName: string;
    orderNumber: string;
    productName: string;
    quantity: number;
    unit: string;
    totalAmount: number;
    deliveryAddress: string;
    estimatedDelivery: string;
    orderId: string;
    userId?: string;
  }) {
    return this.sendEmailWithTemplate(
      'Order Confirmation',
      {
        userName: data.userName,
        orderNumber: data.orderNumber,
        productName: data.productName,
        quantity: data.quantity,
        unit: data.unit,
        totalAmount: data.totalAmount,
        deliveryAddress: data.deliveryAddress,
        estimatedDelivery: data.estimatedDelivery,
        orderUrl: `${process.env.NEXTAUTH_URL}/orders/${data.orderId}`
      },
      data.to,
      data.userId
    );
  }

  // Send payment success email using dynamic template
  async sendPaymentSuccess(data: {
    to: string;
    userName: string;
    orderNumber: string;
    amount: number;
    paymentMethod: string;
    orderId: string;
    userId?: string;
  }) {
    return this.sendEmailWithTemplate(
      'Payment Success',
      {
        userName: data.userName,
        orderNumber: data.orderNumber,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        orderUrl: `${process.env.NEXTAUTH_URL}/orders/${data.orderId}`
      },
      data.to,
      data.userId
    );
  }

  // Send group order threshold met email using dynamic template
  async sendGroupOrderThresholdMet(data: {
    to: string;
    userName: string;
    productName: string;
    batchNumber: string;
    currentQuantity: number;
    targetQuantity: number;
    estimatedDelivery: string;
    groupOrderId: string;
    userId?: string;
  }) {
    const progressPercentage = Math.round((data.currentQuantity / data.targetQuantity) * 100);
    
    return this.sendEmailWithTemplate(
      'Group Order Threshold Met',
      {
        userName: data.userName,
        productName: data.productName,
        batchNumber: data.batchNumber,
        currentQuantity: data.currentQuantity,
        targetQuantity: data.targetQuantity,
        progressPercentage,
        estimatedDelivery: data.estimatedDelivery,
        groupOrderUrl: `${process.env.NEXTAUTH_URL}/group-orders/${data.groupOrderId}`
      },
      data.to,
      data.userId
    );
  }

  // Send order shipped email using dynamic template
  async sendOrderShipped(data: {
    to: string;
    userName: string;
    orderNumber: string;
    productName: string;
    trackingNumber?: string;
    estimatedDelivery: string;
    orderId: string;
    userId?: string;
  }) {
    return this.sendEmailWithTemplate(
      'Order Shipped',
      {
        userName: data.userName,
        orderNumber: data.orderNumber,
        productName: data.productName,
        trackingNumber: data.trackingNumber,
        estimatedDelivery: data.estimatedDelivery,
        orderUrl: `${process.env.NEXTAUTH_URL}/orders/${data.orderId}`
      },
      data.to,
      data.userId
    );
  }

  // Send order delivered email using dynamic template
  async sendOrderDelivered(data: {
    to: string;
    userName: string;
    orderNumber: string;
    productName: string;
    orderId: string;
    userId?: string;
  }) {
    return this.sendEmailWithTemplate(
      'Order Delivered',
      {
        userName: data.userName,
        orderNumber: data.orderNumber,
        productName: data.productName,
        orderUrl: `${process.env.NEXTAUTH_URL}/orders/${data.orderId}`
      },
      data.to,
      data.userId
    );
  }

  // Send password reset email using dynamic template
  async sendPasswordReset(data: {
    to: string;
    userName: string;
    resetUrl: string;
    userId?: string;
  }) {
    return this.sendEmailWithTemplate(
      'Password Reset',
      {
        userName: data.userName,
        resetUrl: data.resetUrl
      },
      data.to,
      data.userId
    );
  }

  // Send price alert email using dynamic template
  async sendPriceAlert(data: {
    to: string;
    userName: string;
    productName: string;
    oldPrice: string;
    newPrice: string;
    savings: string;
    validUntil: string;
    productUrl: string;
    userId?: string;
  }) {
    return this.sendEmailWithTemplate(
      'Price Alert',
      {
        userName: data.userName,
        productName: data.productName,
        oldPrice: data.oldPrice,
        newPrice: data.newPrice,
        savings: data.savings,
        validUntil: data.validUntil,
        productUrl: data.productUrl
      },
      data.to,
      data.userId
    );
  }

  // Send custom email using any template
  async sendCustomEmail(
    templateName: string,
    variables: Record<string, string | number | boolean | undefined>,
    to: string,
    userId?: string,
    campaignId?: string
  ) {
    return this.sendEmailWithTemplate(templateName, variables, to, userId, campaignId);
  }
}

// Export singleton instance
export const dynamicEmailService = DynamicEmailService.getInstance(); 