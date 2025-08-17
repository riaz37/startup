import { prisma } from "../database/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export interface PriceUpdateData {
  productId: string;
  newMrp: number;
  newSellingPrice: number;
  changeReason: string;
  adminId: string;
}



export interface PriceAlertData {
  userId: string;
  productId: string;
  targetPrice: number;
  alertType: 'PRICE_DROP' | 'PRICE_INCREASE' | 'ANY_CHANGE';
}

export class PriceManagementService {
  /**
   * Update product prices and track history
   */
  async updateProductPrices(data: PriceUpdateData) {
    const transaction = await prisma.$transaction(async (tx) => {
      // Get current product prices
      const currentProduct = await tx.product.findUnique({
        where: { id: data.productId },
        select: { mrp: true, sellingPrice: true }
      });

      if (!currentProduct) {
        throw new Error('Product not found');
      }

      // Calculate change percentages
      const mrpChange = this.calculateChangePercentage(currentProduct.mrp, data.newMrp);
      const sellingChange = this.calculateChangePercentage(currentProduct.sellingPrice, data.newSellingPrice);

      // Create price history record
      const priceHistory = await tx.productPriceHistory.create({
        data: {
          productId: data.productId,
          mrp: new Decimal(data.newMrp),

          sellingPrice: new Decimal(data.newSellingPrice),
          changeReason: data.changeReason,
          adminId: data.adminId,
        }
      });

      // Update product prices
      const updatedProduct = await tx.product.update({
        where: { id: data.productId },
        data: {
          mrp: data.newMrp,
          sellingPrice: data.newSellingPrice,
        }
      });

      // Create price change notification if selling price changed significantly
      if (Math.abs(sellingChange) >= 5) { // 5% threshold
        await tx.priceChangeNotification.create({
          data: {
            productId: data.productId,
            oldPrice: currentProduct.sellingPrice,
            newPrice: new Decimal(data.newSellingPrice),
            changePercentage: new Decimal(sellingChange),
            changeType: sellingChange > 0 ? 'INCREASE' : 'DECREASE',
            reason: data.changeReason,
          }
        });
      }

      return { updatedProduct, priceHistory };
    });

    return transaction;
  }

  /**
   * Get price history for a product
   */
  async getProductPriceHistory(productId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const history = await prisma.productPriceHistory.findMany({
      where: {
        productId,
        createdAt: { gte: startDate }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: { name: true, email: true }
        }
      }
    });

    // Convert Decimal values to numbers for the frontend
    return history.map(record => ({
      ...record,
      mrp: Number(record.mrp),

      sellingPrice: Number(record.sellingPrice)
    }));
  }

  /**
   * Get price trends for analytics
   */
  async getPriceTrends(productId: string, days: number = 30) {
    const history = await this.getProductPriceHistory(productId, days);
    
    if (history.length < 2) {
      return { trend: 'stable', changePercentage: 0, volatility: 0 };
    }

    const prices = history.map(h => Number(h.sellingPrice));
    const firstPrice = prices[prices.length - 1];
    const lastPrice = prices[0];
    const changePercentage = this.calculateChangePercentage(firstPrice, lastPrice);

    // Calculate volatility (standard deviation of price changes)
    const priceChanges = [];
    for (let i = 1; i < prices.length; i++) {
      priceChanges.push(this.calculateChangePercentage(prices[i], prices[i - 1]));
    }
    
    const volatility = this.calculateStandardDeviation(priceChanges);

    let trend: 'rising' | 'falling' | 'stable' = 'stable';
    if (changePercentage > 2) trend = 'rising';
    else if (changePercentage < -2) trend = 'falling';

    return { trend, changePercentage, volatility };
  }



  /**
   * Create price alert subscription
   */
  async createPriceAlert(data: PriceAlertData) {
    // Check if alert already exists
    const existingAlert = await prisma.priceAlert.findUnique({
      where: {
        userId_productId: {
          userId: data.userId,
          productId: data.productId
        }
      }
    });

    if (existingAlert) {
      // Update existing alert
      return await prisma.priceAlert.update({
        where: { id: existingAlert.id },
        data: {
          targetPrice: new Decimal(data.targetPrice),
          alertType: data.alertType,
          isActive: true,
        }
      });
    }

    // Create new alert
    return await prisma.priceAlert.create({
      data: {
        userId: data.userId,
        productId: data.productId,
        targetPrice: new Decimal(data.targetPrice),
        alertType: data.alertType,
      }
    });
  }

  /**
   * Check and trigger price alerts
   */
  async checkPriceAlerts(productId: string, newPrice: number) {
    const alerts = await prisma.priceAlert.findMany({
      where: {
        productId,
        isActive: true,
      },
      include: {
        user: true,
        product: true
      }
    });

    const triggeredAlerts = [];

    for (const alert of alerts) {
      const shouldTrigger = this.shouldTriggerAlert(
        alert.alertType,
        Number(alert.targetPrice),
        newPrice
      );

      if (shouldTrigger) {
        triggeredAlerts.push(alert);
        
        // Mark alert as triggered
        await prisma.priceAlert.update({
          where: { id: alert.id },
          data: { lastTriggered: new Date() }
        });
      }
    }

    return triggeredAlerts;
  }

  /**
   * Get user's price alerts
   */
  async getUserPriceAlerts(userId: string) {
    const alerts = await prisma.priceAlert.findMany({
      where: { userId, isActive: true },
      include: {
        product: {
          select: { name: true, slug: true, imageUrl: true, sellingPrice: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Convert Decimal values to numbers for the frontend
    return alerts.map(alert => ({
      ...alert,
      targetPrice: Number(alert.targetPrice),
      product: {
        ...alert.product,
        sellingPrice: Number(alert.product.sellingPrice)
      }
    }));
  }

  /**
   * Deactivate price alert
   */
  async deactivatePriceAlert(alertId: string, userId: string) {
    return await prisma.priceAlert.updateMany({
      where: {
        id: alertId,
        userId
      },
      data: {
        isActive: false
      }
    });
  }

  // Helper methods
  private calculateChangePercentage(oldPrice: number, newPrice: number): number {
    if (oldPrice === 0) return 0;
    return ((newPrice - oldPrice) / oldPrice) * 100;
  }

  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  }

  private shouldTriggerAlert(
    alertType: string, 
    targetPrice: number, 
    currentPrice: number
  ): boolean {
    switch (alertType) {
      case 'PRICE_DROP':
        return currentPrice <= targetPrice;
      case 'PRICE_INCREASE':
        return currentPrice >= targetPrice;
      case 'ANY_CHANGE':
        return Math.abs(currentPrice - targetPrice) / targetPrice > 0.05; // 5% change
      default:
        return false;
    }
  }
} 