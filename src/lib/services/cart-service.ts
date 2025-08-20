import { prisma } from "@/lib/database";
import { Cart, CartItem, AddToCartRequest, UpdateCartItemRequest } from "@/types";
import { redis, safeRedisOperation } from "@/lib/redis";

export class CartService {
  private static readonly CART_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds
  private static readonly GUEST_CART_PREFIX = "guest_cart:";
  private static readonly USER_CART_PREFIX = "user_cart:";

  /**
   * Get or create cart for user (authenticated or guest)
   */
  static async getOrCreateCart(userId?: string, sessionId?: string): Promise<Cart> {
    try {
      if (userId) {
        return this.getOrCreateUserCart(userId);
      } else if (sessionId) {
        return this.getOrCreateGuestCart(sessionId);
      }
      
      throw new Error("Either userId or sessionId must be provided");
    } catch (error) {
      console.error("Error in getOrCreateCart:", error);
      throw error;
    }
  }

  /**
   * Get or create cart for authenticated user
   */
  private static async getOrCreateUserCart(userId: string): Promise<Cart> {
    // Try to get from Redis first
    const redisKey = `${this.USER_CART_PREFIX}${userId}`;
    const cachedCart = await safeRedisOperation(
      () => redis.get(redisKey),
      null
    );
    
    if (cachedCart) {
      return JSON.parse(cachedCart);
    }

    // Get from database
    const dbCart = await prisma.cart.findFirst({
      where: { userId },
      include: { 
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        } 
      },
    });

    if (dbCart && dbCart.userId) {
      const cart = this.mapDbCartToCart({
        id: dbCart.id,
        userId: dbCart.userId,
        totalItems: dbCart.totalItems,
        subtotal: dbCart.subtotal,
        totalDiscount: dbCart.totalDiscount,
        totalAmount: dbCart.totalAmount,
        createdAt: dbCart.createdAt,
        updatedAt: dbCart.updatedAt,
        items: dbCart.items.map(item => ({
          id: item.id,
          productId: item.productId,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          orderType: item.orderType as "priority" | "group",
          groupOrderId: item.groupOrderId,
          product: item.product,
          groupOrder: undefined
        }))
      });
      // Cache in Redis
      await safeRedisOperation(
        () => redis.setEx(redisKey, this.CART_EXPIRY, JSON.stringify(cart)),
        undefined
      );
      return cart;
    }

    // Create new cart
    const newCart = await this.createUserCart(userId);
    return newCart;
  }

  /**
   * Create new user cart
   */
  private static async createUserCart(userId: string): Promise<Cart> {
    const newCart: Cart = {
      id: `user_${userId}`,
      userId,
      items: [],
      totalItems: 0,
      subtotal: 0,
      totalDiscount: 0,
      totalAmount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to database
    await prisma.cart.create({
      data: {
        userId,
        totalItems: 0,
        subtotal: 0,
        totalDiscount: 0,
        totalAmount: 0,
      },
    });

    // Cache in Redis
    const redisKey = `${this.USER_CART_PREFIX}${userId}`;
    await safeRedisOperation(
      () => redis.setEx(redisKey, this.CART_EXPIRY, JSON.stringify(newCart)),
      undefined
    );

    return newCart;
  }

  /**
   * Get or create cart for guest user
   */
  private static async getOrCreateGuestCart(sessionId: string): Promise<Cart> {
    const redisKey = `${this.GUEST_CART_PREFIX}${sessionId}`;
    const cachedCart = await safeRedisOperation(
      () => redis.get(redisKey),
      null
    );
    
    if (cachedCart) {
      return JSON.parse(cachedCart);
    }

    // Create new guest cart
    const newCart: Cart = {
      id: `guest_${sessionId}`,
      sessionId,
      items: [],
      totalItems: 0,
      subtotal: 0,
      totalDiscount: 0,
      totalAmount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store in Redis
    await safeRedisOperation(
      () => redis.setEx(redisKey, this.CART_EXPIRY, JSON.stringify(newCart)),
      undefined
    );
    return newCart;
  }

  /**
   * Add item to cart
   */
  static async addToCart(
    request: AddToCartRequest,
    userId?: string,
    sessionId?: string
  ): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId, sessionId);
    
    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: request.productId },
      include: { category: true },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    if (!product.isActive) {
      throw new Error("Product is not available");
    }

    // Validate quantity
    if (request.quantity < product.minOrderQty) {
      throw new Error(`Minimum order quantity is ${product.minOrderQty}`);
    }

    if (product.maxOrderQty && request.quantity > product.maxOrderQty) {
      throw new Error(`Maximum order quantity is ${product.maxOrderQty}`);
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId === request.productId && 
              item.orderType === request.orderType &&
              item.groupOrderId === request.groupOrderId
    );

    if (existingItemIndex !== -1) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity += request.quantity;
    } else {
      // Add new item
      const newItem: CartItem = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        productId: product.id,
        name: product.name,
        slug: product.slug,
        imageUrl: product.imageUrl || undefined,
        unit: product.unit,
        unitSize: product.unitSize,
        mrp: product.mrp,
        sellingPrice: request.orderType === 'priority' ? product.mrp : product.sellingPrice,
        quantity: request.quantity,
        minOrderQty: product.minOrderQty,
        maxOrderQty: product.maxOrderQty || undefined,
        categoryId: product.categoryId,
        categoryName: product.category.name,
        orderType: request.orderType,
        groupOrderId: request.groupOrderId,
        expiresAt: request.groupOrderId ? await this.getGroupOrderExpiry(request.groupOrderId) : undefined,
      };

      cart.items.push(newItem);
    }

    // Recalculate totals
    this.recalculateCartTotals(cart);
    cart.updatedAt = new Date().toISOString();

    // Save cart
    if (userId) {
      await this.saveUserCart(userId, cart);
    } else if (sessionId) {
      await this.saveGuestCart(sessionId, cart);
    }

    return cart;
  }

  /**
   * Update cart item quantity
   */
  static async updateCartItem(
    request: UpdateCartItemRequest,
    userId?: string,
    sessionId?: string
  ): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId, sessionId);
    
    const itemIndex = cart.items.findIndex(item => item.id === request.itemId);
    if (itemIndex === -1) {
      throw new Error("Cart item not found");
    }

    const item = cart.items[itemIndex];
    
    // Validate quantity
    if (request.quantity < item.minOrderQty) {
      throw new Error(`Minimum order quantity is ${item.minOrderQty}`);
    }

    if (item.maxOrderQty && request.quantity > item.maxOrderQty) {
      throw new Error(`Maximum order quantity is ${item.maxOrderQty}`);
    }

    if (request.quantity === 0) {
      // Remove item
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = request.quantity;
    }

    // Recalculate totals
    this.recalculateCartTotals(cart);
    cart.updatedAt = new Date().toISOString();

    // Save cart
    if (userId) {
      await this.saveUserCart(userId, cart);
    } else if (sessionId) {
      await this.saveGuestCart(sessionId, cart);
    }

    return cart;
  }

  /**
   * Remove item from cart
   */
  static async removeFromCart(
    itemId: string,
    userId?: string,
    sessionId?: string
  ): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId, sessionId);
    
    cart.items = cart.items.filter(item => item.id !== itemId);
    
    // Recalculate totals
    this.recalculateCartTotals(cart);
    cart.updatedAt = new Date().toISOString();

    // Save cart
    if (userId) {
      await this.saveUserCart(userId, cart);
    } else if (sessionId) {
      await this.saveGuestCart(sessionId, cart);
    }

    return cart;
  }

  /**
   * Clear cart
   */
  static async clearCart(userId?: string, sessionId?: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId, sessionId);
    
    cart.items = [];
    this.recalculateCartTotals(cart);
    cart.updatedAt = new Date().toISOString();

    // Save cart
    if (userId) {
      await this.saveUserCart(userId, cart);
    } else if (sessionId) {
      await this.saveGuestCart(sessionId, cart);
    }

    return cart;
  }

  /**
   * Merge guest cart with user cart after login
   */
  static async mergeGuestCart(sessionId: string, userId: string): Promise<Cart> {
    const guestCart = await this.getOrCreateGuestCart(sessionId);
    const userCart = await this.getOrCreateUserCart(userId);

    // Merge items from guest cart to user cart
    for (const guestItem of guestCart.items) {
      const existingItemIndex = userCart.items.findIndex(
        item => item.productId === guestItem.productId && 
                item.orderType === guestItem.orderType &&
                item.groupOrderId === guestItem.groupOrderId
      );

      if (existingItemIndex !== -1) {
        // Update existing item quantity
        userCart.items[existingItemIndex].quantity += guestItem.quantity;
      } else {
        // Add new item
        userCart.items.push({
          ...guestItem,
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        });
      }
    }

    // Recalculate totals
    this.recalculateCartTotals(userCart);
    userCart.updatedAt = new Date().toISOString();

    // Save merged cart
    await this.saveUserCart(userId, userCart);

    // Clear guest cart
    await this.clearGuestCart(sessionId);

    return userCart;
  }

  /**
   * Get group order expiry date
   */
  private static async getGroupOrderExpiry(groupOrderId: string): Promise<string | undefined> {
    const groupOrder = await prisma.groupOrder.findUnique({
      where: { id: groupOrderId },
      select: { expiresAt: true },
    });

    return groupOrder?.expiresAt?.toISOString();
  }

  /**
   * Recalculate cart totals
   */
  private static recalculateCartTotals(cart: Cart): void {
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.subtotal = cart.items.reduce((sum, item) => sum + (item.mrp * item.quantity), 0);
    cart.totalDiscount = cart.items.reduce((sum, item) => {
      const discount = (item.mrp - item.sellingPrice) * item.quantity;
      return sum + discount;
    }, 0);
    cart.totalAmount = cart.items.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
  }

  /**
   * Save user cart to database and Redis
   */
  private static async saveUserCart(userId: string, cart: Cart): Promise<void> {
    // Save to database
    await prisma.cart.upsert({
      where: { userId },
      update: {
        totalItems: cart.totalItems,
        subtotal: cart.subtotal,
        totalDiscount: cart.totalDiscount,
        totalAmount: cart.totalAmount,
        updatedAt: new Date(),
        items: {
          deleteMany: {},
          create: cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.sellingPrice,
            orderType: item.orderType,
            groupOrderId: item.groupOrderId,
          })),
        },
      },
      create: {
        userId,
        totalItems: cart.totalItems,
        subtotal: cart.subtotal,
        totalDiscount: cart.totalDiscount,
        totalAmount: cart.totalAmount,
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.sellingPrice,
            orderType: item.orderType,
            groupOrderId: item.groupOrderId,
          })),
        },
      },
    });

    // Cache in Redis
    const redisKey = `${this.USER_CART_PREFIX}${userId}`;
    await safeRedisOperation(
      () => redis.setEx(redisKey, this.CART_EXPIRY, JSON.stringify(cart)),
      undefined
    );
  }

  /**
   * Save guest cart to Redis
   */
  private static async saveGuestCart(sessionId: string, cart: Cart): Promise<void> {
    const redisKey = `${this.GUEST_CART_PREFIX}${sessionId}`;
    await safeRedisOperation(
      () => redis.setEx(redisKey, this.CART_EXPIRY, JSON.stringify(cart)),
      undefined
    );
  }

  /**
   * Clear guest cart from Redis
   */
  private static async clearGuestCart(sessionId: string): Promise<void> {
    const redisKey = `${this.GUEST_CART_PREFIX}${sessionId}`;
    await safeRedisOperation(
      () => redis.del(redisKey),
      undefined
    );
  }

  /**
   * Map database cart to Cart interface
   */
  private static mapDbCartToCart(dbCart: {
    id: string;
    userId: string | null;
    totalItems: number;
    subtotal: number;
    totalDiscount: number;
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
    items: Array<{
      id: string;
      productId: string;
      unitPrice: number;
      quantity: number;
      orderType: "priority" | "group";
      groupOrderId: string | null;
      product?: {
        name: string;
        slug: string;
        imageUrl?: string;
        unit: string;
        unitSize: number;
        mrp: number;
        minOrderQty: number;
        maxOrderQty?: number;
        categoryId: string;
        category?: {
          name: string;
        };
      };
      groupOrder?: {
        expiresAt?: Date;
      };
    }>;
  }): Cart {
    return {
      id: dbCart.id,
      userId: dbCart.userId || undefined,
      items: dbCart.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.product?.name || '',
        slug: item.product?.slug || '',
        imageUrl: item.product?.imageUrl,
        unit: item.product?.unit || '',
        unitSize: item.product?.unitSize || 0,
        mrp: item.product?.mrp || 0,
        sellingPrice: item.unitPrice,
        quantity: item.quantity,
        minOrderQty: item.product?.minOrderQty || 1,
        maxOrderQty: item.product?.maxOrderQty,
        categoryId: item.product?.categoryId || '',
        categoryName: item.product?.category?.name || '',
        orderType: item.orderType,
        groupOrderId: item.groupOrderId || undefined,
        expiresAt: item.groupOrder?.expiresAt?.toISOString(),
      })),
      totalItems: dbCart.totalItems,
      subtotal: dbCart.subtotal,
      totalDiscount: dbCart.totalDiscount,
      totalAmount: dbCart.totalAmount,
      createdAt: dbCart.createdAt.toISOString(),
      updatedAt: dbCart.updatedAt.toISOString(),
    };
  }
} 