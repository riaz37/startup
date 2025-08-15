import nodemailer from "nodemailer";
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
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Email delivery tracking
interface EmailDelivery {
  id: string;
  to: string;
  subject: string;
  template: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt?: Date;
  deliveredAt?: Date;
  error?: string;
  retryCount: number;
}

class EmailDeliveryTracker {
  private deliveries = new Map<string, EmailDelivery>();

  trackDelivery(emailId: string, delivery: Omit<EmailDelivery, 'id'>) {
    this.deliveries.set(emailId, {
      id: emailId,
      ...delivery,
      retryCount: 0,
    });
  }

  markSent(emailId: string) {
    const delivery = this.deliveries.get(emailId);
    if (delivery) {
      delivery.status = 'sent';
      delivery.sentAt = new Date();
    }
  }

  markDelivered(emailId: string) {
    const delivery = this.deliveries.get(emailId);
    if (delivery) {
      delivery.status = 'delivered';
      delivery.deliveredAt = new Date();
    }
  }

  markFailed(emailId: string, error: string) {
    const delivery = this.deliveries.get(emailId);
    if (delivery) {
      delivery.status = 'failed';
      delivery.error = error;
      delivery.retryCount++;
    }
  }

  getDeliveryStatus(emailId: string): EmailDelivery | undefined {
    return this.deliveries.get(emailId);
  }

  getFailedDeliveries(): EmailDelivery[] {
    return Array.from(this.deliveries.values()).filter(d => d.status === 'failed');
  }
}

const emailTracker = new EmailDeliveryTracker();

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

  // Send email with tracking
  private async sendEmailWithTracking(
    to: string,
    subject: string,
    html: string,
    template: string
  ) {
    const emailId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Track delivery
    emailTracker.trackDelivery(emailId, {
      to,
      subject,
      template,
      status: 'pending',
      retryCount: 0,
    });

    try {
      const info = await transporter.sendMail({
        from: `"Sohozdaam" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        headers: {
          'X-Email-ID': emailId,
          'X-Template': template,
        },
      });

      // Mark as sent
      emailTracker.markSent(emailId);
      
      console.log(`Email sent successfully: ${emailId} to ${to}`);
      return { success: true, emailId, messageId: info.messageId };
    } catch (error) {
      // Mark as failed
      emailTracker.markFailed(emailId, error instanceof Error ? error.message : 'Unknown error');
      
      console.error(`Email failed to send: ${emailId} to ${to}`, error);
      return { success: false, emailId, error };
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
  }) {
    try {
      const result = await this.sendEmailWithTracking(
        data.to,
        data.subject,
        data.html,
        'custom_email'
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
    const failedDeliveries = emailTracker.getFailedDeliveries();
    const results = [];

    for (const delivery of failedDeliveries) {
      if (delivery.retryCount < 3) { // Max 3 retries
        try {
          // Re-send the email (you might want to store the original HTML)
          const result = await this.sendCustomEmail({
            to: delivery.to,
            subject: delivery.subject,
            html: `<p>Retry attempt for: ${delivery.subject}</p>`,
          });
          results.push({ emailId: delivery.id, result });
        } catch (error) {
          results.push({ emailId: delivery.id, error });
        }
      }
    }

    return results;
  }

  // Get email delivery status
  getEmailDeliveryStatus(emailId: string) {
    return emailTracker.getDeliveryStatus(emailId);
  }

  // Get email delivery statistics
  getEmailDeliveryStats() {
    const deliveries = Array.from(emailTracker.getFailedDeliveries());
    const total = deliveries.length;
    const pending = deliveries.filter(d => d.status === 'pending').length;
    const sent = deliveries.filter(d => d.status === 'sent').length;
    const delivered = deliveries.filter(d => d.status === 'delivered').length;
    const failed = deliveries.filter(d => d.status === 'failed').length;

    return {
      total,
      pending,
      sent,
      delivered,
      failed,
      successRate: total > 0 ? ((sent + delivered) / total) * 100 : 0,
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