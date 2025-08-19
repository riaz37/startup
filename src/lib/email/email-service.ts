import nodemailer from "nodemailer";
import { prisma } from "@/lib/database";
import {
  orderConfirmationTemplate,
  paymentSuccessTemplate,
  groupOrderThresholdMetTemplate,
  orderShippedTemplate,
  orderDeliveredTemplate,
  welcomeEmailTemplate,
  passwordResetTemplate,
} from "./email-templates";

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

// Email service class
export class EmailService {
  private static instance: EmailService;

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  // Send email with database tracking
  private async sendEmailWithTracking(
    to: string,
    subject: string,
    html: string,
    template: string,
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
          templateId: template,
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
          'X-Template': template,
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

  // Send order confirmation email
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
  }) {
    try {
      const html = orderConfirmationTemplate(data);
      
      const result = await this.sendEmailWithTracking(
        data.to,
        `Order Confirmed - ${data.orderNumber}`,
        html,
        'order_confirmation'
      );

      if (result.success) {
        console.log(`Order confirmation email sent to ${data.to}`);
      }
      
      return result;
    } catch (error) {
      console.error("Error sending order confirmation email:", error);
      return { success: false, error };
    }
  }

  // Send payment success email
  async sendPaymentSuccess(data: {
    to: string;
    userName: string;
    orderNumber: string;
    amount: number;
    paymentMethod: string;
    orderId: string;
  }) {
    try {
      const html = paymentSuccessTemplate(data);
      
      const result = await this.sendEmailWithTracking(
        data.to,
        `Payment Successful - ${data.orderNumber}`,
        html,
        'payment_success'
      );

      if (result.success) {
        console.log(`Payment success email sent to ${data.to}`);
      }
      
      return result;
    } catch (error) {
      console.error("Error sending payment success email:", error);
      return { success: false, error };
    }
  }

  // Send group order threshold met email
  async sendGroupOrderThresholdMet(data: {
    to: string;
    userName: string;
    productName: string;
    batchNumber: string;
    currentQuantity: number;
    targetQuantity: number;
    estimatedDelivery: string;
    groupOrderId: string;
  }) {
    try {
      const html = groupOrderThresholdMetTemplate(data);
      
      const result = await this.sendEmailWithTracking(
        data.to,
        `Group Order Threshold Met - ${data.batchNumber}`,
        html,
        'group_order_threshold_met'
      );

      if (result.success) {
        console.log(`Group order threshold met email sent to ${data.to}`);
      }
      
      return result;
    } catch (error) {
      console.error("Error sending group order threshold met email:", error);
      return { success: false, error };
    }
  }

  // Send order shipped email
  async sendOrderShipped(data: {
    to: string;
    userName: string;
    orderNumber: string;
    productName: string;
    trackingNumber?: string;
    estimatedDelivery: string;
    orderId: string;
  }) {
    try {
      const html = orderShippedTemplate(data);
      
      const result = await this.sendEmailWithTracking(
        data.to,
        `Order Shipped - ${data.orderNumber}`,
        html,
        'order_shipped'
      );

      if (result.success) {
        console.log(`Order shipped email sent to ${data.to}`);
      }
      
      return result;
    } catch (error) {
      console.error("Error sending order shipped email:", error);
      return { success: false, error };
    }
  }

  // Send order delivered email
  async sendOrderDelivered(data: {
    to: string;
    userName: string;
    orderNumber: string;
    productName: string;
    orderId: string;
  }) {
    try {
      const html = orderDeliveredTemplate(data);
      
      const result = await this.sendEmailWithTracking(
        data.to,
        `Order Delivered - ${data.orderNumber}`,
        html,
        'order_delivered'
      );

      if (result.success) {
        console.log(`Order delivered email sent to ${data.to}`);
      }
      
      return result;
    } catch (error) {
      console.error("Error sending order delivered email:", error);
      return { success: false, error };
    }
  }

  // Send welcome email
  async sendWelcomeEmail(data: {
    to: string;
    userName: string;
    verificationUrl?: string;
  }) {
    try {
      const html = welcomeEmailTemplate(data);
      
      const result = await this.sendEmailWithTracking(
        data.to,
        "Welcome to Sohozdaam!",
        html,
        'welcome_email'
      );

      if (result.success) {
        console.log(`Welcome email sent to ${data.to}`);
      }
      
      return result;
    } catch (error) {
      console.error("Error sending welcome email:", error);
      return { success: false, error };
    }
  }

  // Send password reset email
  async sendPasswordReset(data: {
    to: string;
    userName: string;
    resetUrl: string;
  }) {
    try {
      const html = passwordResetTemplate(data);
      
      const result = await this.sendEmailWithTracking(
        data.to,
        "Reset Your Password - Sohozdaam",
        html,
        'password_reset'
      );

      if (result.success) {
        console.log(`Password reset email sent to ${data.to}`);
      }
      
      return result;
    } catch (error) {
      console.error("Error sending password reset email:", error);
      return { success: false, error };
    }
  }

  // Send custom email
  async sendCustomEmail(data: {
    to: string;
    subject: string;
    html: string;
    userId?: string;
    campaignId?: string;
  }) {
    try {
      const result = await this.sendEmailWithTracking(
        data.to,
        data.subject,
        data.html,
        'custom_email',
        data.userId,
        data.campaignId
      );

      if (result.success) {
        console.log(`Custom email sent to ${data.to}`);
      }
      
      return result;
    } catch (error) {
      console.error("Error sending custom email:", error);
      return { success: false, error };
    }
  }

  // Retry failed emails
  async retryFailedEmails() {
    const failedDeliveries = await prisma.emailDelivery.findMany({
      where: { 
        status: 'FAILED',
        retryCount: { lt: 3 } // Max 3 retries
      }
    });

    const results = [];

    for (const delivery of failedDeliveries) {
      try {
        // Update retry count and status
        await prisma.emailDelivery.update({
          where: { id: delivery.id },
          data: {
            retryCount: { increment: 1 },
            status: 'PENDING',
            failedAt: null,
            error: null
          }
        });

        // Re-send the email
        const result = await this.sendCustomEmail({
          to: delivery.to,
          subject: delivery.subject,
          html: delivery.content,
          userId: delivery.userId || undefined,
          campaignId: delivery.campaignId || undefined
        });

        results.push({ emailId: delivery.id, result });
      } catch (error) {
        results.push({ 
          emailId: delivery.id, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return results;
  }

  // Get email delivery status
  async getEmailDeliveryStatus(emailId: string) {
    return await prisma.emailDelivery.findUnique({
      where: { id: emailId }
    });
  }

  // Get email delivery statistics from database
  async getEmailDeliveryStats() {
    const [totalSent, totalDelivered, totalFailed, totalPending] = await Promise.all([
      prisma.emailDelivery.count({ where: { status: { in: ['SENT', 'DELIVERED'] } } }),
      prisma.emailDelivery.count({ where: { status: 'DELIVERED' } }),
      prisma.emailDelivery.count({ where: { status: 'FAILED' } }),
      prisma.emailDelivery.count({ where: { status: 'PENDING' } })
    ]);

    const total = totalSent + totalDelivered + totalFailed + totalPending;
    const successRate = total > 0 ? ((totalDelivered + totalSent) / total) * 100 : 0;

    return {
      total,
      pending: totalPending,
      sent: totalSent,
      delivered: totalDelivered,
      failed: totalFailed,
      successRate: Math.round(successRate * 100) / 100,
    };
  }

  // Test email configuration
  async testConnection() {
    try {
      await transporter.verify();
      console.log("Email service connection verified");
      return { success: true };
    } catch (error) {
      console.error("Email service connection failed:", error);
      return { success: false, error };
    }
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance(); 