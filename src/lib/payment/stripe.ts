import Stripe from 'stripe';
import { prisma } from '@/lib/database';
import { OrderStatus, PaymentStatus } from '@/generated/prisma';
import { emailService } from '@/lib/email/email-service';

// Initialize Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
  typescript: true,
});

// Stripe configuration
export const STRIPE_CONFIG = {
  currency: 'bdt',
  paymentMethods: ['card', 'upi', 'netbanking', 'wallet'] as const,
  successUrl: `${process.env.NEXTAUTH_URL}/orders/confirmation?success=true`,
  cancelUrl: `${process.env.NEXTAUTH_URL}/orders/confirmation?canceled=true`,
};

// Payment intent creation
export async function createPaymentIntent(
  orderId: string,
  amount: number,
  metadata: Record<string, string> = {}
) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: STRIPE_CONFIG.currency,
      metadata: {
        orderId,
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
      capture_method: 'automatic',
      confirmation_method: 'automatic',
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new Error('Failed to create payment intent');
  }
}

// Webhook event handling
export async function handleStripeWebhook(
  event: Stripe.Event,
  signature: string
) {
  try {
    // Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    const verifiedEvent = stripe.webhooks.constructEvent(
      JSON.stringify(event),
      signature,
      webhookSecret
    );

    switch (verifiedEvent.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(verifiedEvent.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(verifiedEvent.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.canceled':
        await handlePaymentCanceled(verifiedEvent.data.object as Stripe.PaymentIntent);
        break;
      
      case 'charge.refunded':
        await handlePaymentRefunded(verifiedEvent.data.object as Stripe.Charge);
        break;
      
      default:
        console.log(`Unhandled event type: ${verifiedEvent.type}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Webhook error:', error);
    throw new Error('Webhook signature verification failed');
  }
}

// Handle successful payment
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { orderId } = paymentIntent.metadata;
  
  if (!orderId) {
    console.error('No orderId in payment intent metadata');
    return;
  }

  try {
    // Fetch order with related data
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        groupOrder: {
          include: {
            product: true,
          },
        },
        address: true,
      },
    });

    if (!order) {
      console.error(`Order not found: ${orderId}`);
      return;
    }

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CONFIRMED,
        paymentStatus: PaymentStatus.COMPLETED,
        confirmedAt: new Date(),
      },
    });

    // Update payment record
    await prisma.payment.updateMany({
      where: { orderId },
      data: {
        status: PaymentStatus.COMPLETED,
        processedAt: new Date(),
        gatewayPaymentId: paymentIntent.id,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: order.userId,
        type: 'PAYMENT_SUCCESS',
        title: 'Payment Successful',
        message: `Your payment of ৳${paymentIntent.amount / 100} has been processed successfully.`,
        data: { orderId, amount: paymentIntent.amount / 100 },
      },
    });

    // Send email notifications
    await Promise.all([
      // Payment success email
      emailService.sendPaymentSuccess({
        to: order.user.email,
        userName: order.user.name,
        orderNumber: order.orderNumber,
        amount: order.totalAmount,
        paymentMethod: 'Credit/Debit Card',
        orderId: order.id,
      }),
      
      // Order confirmation email
      emailService.sendOrderConfirmation({
        to: order.user.email,
        userName: order.user.name,
        orderNumber: order.orderNumber,
        productName: order.groupOrder.product.name,
        quantity: 1, // Default quantity, can be enhanced later
        unit: order.groupOrder.product.unit,
        totalAmount: order.totalAmount,
        deliveryAddress: `${order.address.addressLine1}, ${order.address.city}, ${order.address.state} ${order.address.pincode}`,
        estimatedDelivery: order.groupOrder.estimatedDelivery?.toLocaleDateString() || 'TBD',
        orderId: order.id,
      }),
    ]);

    console.log(`Payment successful for order: ${orderId}`);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

// Handle payment failure
async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const { orderId } = paymentIntent.metadata;
  
  if (!orderId) return;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) return;

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.FAILED,
      },
    });

    await prisma.payment.updateMany({
      where: { orderId },
      data: {
        status: PaymentStatus.FAILED,
        failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: order.userId,
        type: 'PAYMENT_FAILED',
        title: 'Payment Failed',
        message: 'Your payment was unsuccessful. Please try again.',
        data: { orderId },
      },
    });

    console.log(`Payment failed for order: ${orderId}`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

// Handle payment cancellation
async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  const { orderId } = paymentIntent.metadata;
  
  if (!orderId) return;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) return;

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
        paymentStatus: PaymentStatus.FAILED,
        cancelledAt: new Date(),
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: order.userId,
        type: 'ORDER_CANCELLED',
        title: 'Order Cancelled',
        message: 'Your order has been cancelled due to payment cancellation.',
        data: { orderId },
      },
    });

    console.log(`Payment canceled for order: ${orderId}`);
  } catch (error) {
    console.error('Error handling payment cancellation:', error);
  }
}

// Handle payment refund
async function handlePaymentRefunded(charge: Stripe.Charge) {
  try {
    // Find payment by charge ID
    const payment = await prisma.payment.findFirst({
      where: { gatewayPaymentId: charge.payment_intent as string },
      include: { order: { include: { user: true } } },
    });

    if (!payment) return;

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.REFUNDED,
        refundedAt: new Date(),
        refundAmount: charge.amount_refunded / 100,
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: payment.orderId },
      data: {
        status: OrderStatus.REFUNDED,
        paymentStatus: PaymentStatus.REFUNDED,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: payment.order.userId,
        type: 'GENERAL',
        title: 'Payment Refunded',
        message: `Your payment of ৳${payment.amount} has been refunded.`,
        data: { orderId: payment.orderId, amount: payment.amount },
      },
    });

    console.log(`Payment refunded for order: ${payment.orderId}`);
  } catch (error) {
    console.error('Error handling payment refund:', error);
  }
}

// Get payment methods
export async function getPaymentMethods(customerId: string) {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    return paymentMethods.data;
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return [];
  }
}

// Create customer
export async function createStripeCustomer(email: string, name: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        source: 'sohozdaam',
      },
    });
    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw new Error('Failed to create customer');
  }
}

// Refund payment
export async function refundPayment(paymentIntentId: string, amount?: number, reason?: string) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason: (reason as 'duplicate' | 'fraudulent' | 'requested_by_customer') || 'requested_by_customer',
      metadata: {
        refundedBy: 'admin',
        reason: reason || 'Customer request',
      },
    });
    return refund;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw new Error('Failed to process refund');
  }
}

// Get payment details
export async function getPaymentDetails(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error fetching payment details:', error);
    throw new Error('Failed to fetch payment details');
  }
}

// Cancel payment intent
export async function cancelPaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error cancelling payment intent:', error);
    throw new Error('Failed to cancel payment intent');
  }
}

// Update payment intent
export async function updatePaymentIntent(
  paymentIntentId: string,
  updates: {
    amount?: number;
    metadata?: Record<string, string>;
  }
) {
  try {
    const updateData: Stripe.PaymentIntentUpdateParams = {};
    
    if (updates.amount) {
      updateData.amount = Math.round(updates.amount * 100);
    }
    
    if (updates.metadata) {
      updateData.metadata = updates.metadata;
    }

    const paymentIntent = await stripe.paymentIntents.update(
      paymentIntentId,
      updateData
    );
    
    return paymentIntent;
  } catch (error) {
    console.error('Error updating payment intent:', error);
    throw new Error('Failed to update payment intent');
  }
} 