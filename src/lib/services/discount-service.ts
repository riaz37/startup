import { prisma } from "@/lib/database";

export interface CreateDiscountConfigData {
  name: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minQuantity?: number;
  maxQuantity?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface UpdateDiscountConfigData extends Partial<CreateDiscountConfigData> {
  isActive?: boolean;
}

export interface DiscountConfig {
  id: string;
  name: string;
  description?: string | null;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  isActive: boolean;
  minQuantity?: number | null;
  maxQuantity?: number | null;
  startDate?: Date | null;
  endDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicableDiscount extends DiscountConfig {
  discountAmount: number;
}

export class DiscountService {
  // Create a new discount configuration
  static async createDiscountConfig(data: CreateDiscountConfigData) {
    return await prisma.discountConfig.create({
      data: {
        name: data.name,
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minQuantity: data.minQuantity,
        maxQuantity: data.maxQuantity,
        startDate: data.startDate,
        endDate: data.endDate,
      },
    });
  }

  // Get all discount configurations
  static async getAllDiscountConfigs() {
    return await prisma.discountConfig.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get active discount configurations
  static async getActiveDiscountConfigs() {
    const now = new Date();
    return await prisma.discountConfig.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null },
          { startDate: { lte: now } },
        ],
        AND: [
          { endDate: null },
          { endDate: { gte: now } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get discount configuration by ID
  static async getDiscountConfigById(id: string) {
    return await prisma.discountConfig.findUnique({
      where: { id },
    });
  }

  // Update discount configuration
  static async updateDiscountConfig(id: string, data: UpdateDiscountConfigData) {
    return await prisma.discountConfig.update({
      where: { id },
      data,
    });
  }

  // Delete discount configuration
  static async deleteDiscountConfig(id: string) {
    return await prisma.discountConfig.delete({
      where: { id },
    });
  }

  // Calculate discount for a given quantity and base price
  static calculateDiscount(basePrice: number, quantity: number, discountConfigs: DiscountConfig[]) {
    let totalDiscount = 0;
    const applicableDiscounts: ApplicableDiscount[] = [];

    for (const config of discountConfigs) {
      if (!config.isActive) continue;

      // Check date range
      const now = new Date();
      if (config.startDate && config.startDate > now) continue;
      if (config.endDate && config.endDate < now) continue;

      // Check quantity range
      if (config.minQuantity && quantity < config.minQuantity) continue;
      if (config.maxQuantity && quantity > config.maxQuantity) continue;

      let discountAmount = 0;
      if (config.discountType === 'PERCENTAGE') {
        discountAmount = (basePrice * config.discountValue) / 100;
      } else if (config.discountType === 'FIXED_AMOUNT') {
        discountAmount = config.discountValue;
      }

      totalDiscount += discountAmount;
      applicableDiscounts.push({
        ...config,
        discountAmount,
      });
    }

    return {
      totalDiscount,
      discountedPrice: basePrice - totalDiscount,
      applicableDiscounts,
    };
  }

  // Get default bulk discount (for backward compatibility)
  static async getDefaultBulkDiscount() {
    const defaultDiscount = await prisma.discountConfig.findFirst({
      where: {
        name: 'Default Bulk Purchase Discount',
        isActive: true,
      },
    });

    if (!defaultDiscount) {
      // Create default discount if none exists
      return await this.createDiscountConfig({
        name: 'Default Bulk Purchase Discount',
        description: 'Default 10% discount for bulk purchases',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minQuantity: 1,
      });
    }

    return defaultDiscount;
  }
} 