// ============================================================================
// PRODUCT TYPES
// ============================================================================

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  unit: string;
  unitSize: number;
  mrp: number;
  sellingPrice: number;
  isActive: boolean;
  minOrderQty: number;
  maxOrderQty?: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  unit: string;
  unitSize: number;
  mrp: number;
  sellingPrice: number;
  minOrderQty: number;
  maxOrderQty?: number;
  categoryId: string;
  imageUrl?: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  unit?: string;
  unitSize?: number;
  mrp?: number;
  sellingPrice?: number;
  minOrderQty?: number;
  maxOrderQty?: number;
  categoryId?: string;
  imageUrl?: string;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ============================================================================
// ORDER TYPES
// ============================================================================

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    name: string;
    unit: string;
    unitSize: number;
    imageUrl?: string;
  };
}

export interface Order {
  id: string;
  userId: string;
  groupOrderId: string;
  addressId: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentId?: string;
  notes?: string;
  placedAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
  groupOrder?: GroupOrder;
  address?: Address;
  user?: User;
}

export interface CreateOrderRequest {
  productId: string;
  quantity: number;
  addressId: string;
  notes?: string;
  groupOrderId?: string;
}

export interface UpdateOrderRequest {
  status?: string;
  deliveryAddress?: string;
  notes?: string;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ============================================================================
// GROUP ORDER TYPES
// ============================================================================

export interface GroupOrder {
  id: string;
  batchNumber: string;
  productId: string;
  productName: string;
  minThreshold: number;
  targetQuantity: number;
  currentQuantity: number;
  currentAmount: number;
  pricePerUnit: number;
  status: string;
  expiresAt: string;
  estimatedDelivery: string | null;
  progressPercentage: number;
  participantCount: number;
  timeRemaining: number;
  product: {
    id: string;
    name: string;
    unit: string;
    unitSize: number;
    imageUrl: string | null;
    category: {
      name: string;
    };
  };
}

export interface CreateGroupOrderRequest {
  productId: string;
  minThreshold: number;
  targetQuantity: number;
  expiresAt: string;
}

export interface JoinGroupOrderRequest {
  quantity: number;
  notes?: string;
}

export interface GroupOrdersResponse {
  groupOrders: GroupOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

export enum PaymentMethod {
  CARD = "CARD",
  UPI = "UPI",
  NETBANKING = "NETBANKING",
  WALLET = "WALLET",
  CASH_ON_DELIVERY = "CASH_ON_DELIVERY"
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED",
  CASH_ON_DELIVERY = "CASH_ON_DELIVERY"
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
  order?: {
    orderNumber: string;
    productName: string;
  };
}

export interface CreatePaymentIntentRequest {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod?: PaymentMethod;
}

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
}

export interface RefundRequest {
  paymentId: string;
  amount?: number;
  reason: string;
}

export interface PaymentsResponse {
  payments: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  image?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResendVerificationRequest {
  email: string;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UnreadCountResponse {
  count: number;
}

// ============================================================================
// DELIVERY TYPES
// ============================================================================

export interface DeliveryLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactPerson: string;
  contactPhone: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  deliveryType: 'PICKUP' | 'HOME_DELIVERY';
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';
  pickupLocation?: string;
  deliveryAddress?: string;
  scheduledDate: string;
  actualDeliveryDate?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeliveryRequest {
  orderId: string;
  deliveryType: 'PICKUP' | 'HOME_DELIVERY';
  pickupLocationId?: string;
  deliveryAddress?: string;
  scheduledDate: string;
  notes?: string;
}

export interface UpdateDeliveryRequest {
  status?: string;
  actualDeliveryDate?: string;
  trackingNumber?: string;
  notes?: string;
}

export interface DeliveryStatusUpdateRequest {
  status: string;
  notes?: string;
}

export interface DeliveriesResponse {
  deliveries: Delivery[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface DeliveryLocationsResponse {
  locations: DeliveryLocation[];
}

// ============================================================================
// ADDRESS TYPES
// ============================================================================

export interface Address {
  id: string;
  userId: string;
  type: 'home' | 'work' | 'other';
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  country: string;
  isDefault: boolean;
  contactPerson: string;
  contactPhone: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressRequest {
  type: Address['type'];
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  country: string;
  isDefault: boolean;
  contactPerson: string;
  contactPhone: string;
}

export interface UpdateAddressRequest {
  type?: 'home' | 'work' | 'other';
  name?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
  country?: string;
  isDefault?: boolean;
  contactPerson?: string;
  contactPhone?: string;
}

export interface AddressesResponse {
  addresses: Address[];
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface SalesMetrics {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  salesGrowth: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    totalSold: number;
    revenue: number;
  }>;
}

export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  userGrowth: number;
  topUsers: Array<{
    userId: string;
    userName: string;
    totalOrders: number;
    totalSpent: number;
  }>;
}

export interface OrderMetrics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  orderGrowth: number;
  averageOrderValue: number;
}

export interface GroupOrderMetrics {
  totalGroupOrders: number;
  activeGroupOrders: number;
  completedGroupOrders: number;
  averageParticipants: number;
  successRate: number;
}

export interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  revenueByCategory: Array<{
    category: string;
    revenue: number;
    percentage: number;
  }>;
}

export interface DashboardAnalytics {
  sales: SalesMetrics;
  users: UserMetrics;
  orders: OrderMetrics;
  groupOrders: GroupOrderMetrics;
  revenue: RevenueMetrics;
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
  status?: string;
}

export interface ExportFormat {
  format: 'csv' | 'excel';
  filters?: AnalyticsFilters;
}

// ============================================================================
// EMAIL MANAGEMENT TYPES
// ============================================================================

export interface EmailStats {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  deliveryRate: number;
  failureRate: number;
  averageDeliveryTime: number;
}

export interface FailedEmail {
  id: string;
  to: string;
  subject: string;
  template: string;
  error: string;
  retryCount: number;
  maxRetries: number;
  lastAttempt: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateEmailTemplateRequest {
  subject?: string;
  content?: string;
  isActive?: boolean;
}

export interface TestConnectionResult {
  result: {
    success: boolean;
    message?: string;
  };
}

export interface EmailManagementResponse {
  stats?: EmailStats;
  failedEmails?: FailedEmail[];
  templates?: EmailTemplate[];
  result?: TestConnectionResult;
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface ProductCardProps {
  product: Product;
  formatPrice: (price: number) => string;
  calculateDiscount: (mrp: number, sellingPrice: number) => number;
}

export interface OrderManagementProps {
  userId: string;
}

export interface PaymentFormProps {
  orderId: string;
  amount: number;
  onSuccess?: () => void;
  onFailure?: (error: string) => void;
}

export interface PaymentHistoryProps {
  userId: string;
}

export interface NotificationBellProps {
  userId: string;
}

export interface RecentActivityProps {
  activities: ActivityItem[];
}

export interface Testimonial {
  name: string;
  role: string;
  initials: string;
  content: string;
  rating: number;
}

export interface ActivityItem {
  id: string;
  type: "order" | "group_order" | "product";
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  href?: string;
  amount?: number;
  progress?: number;
}

// ============================================================================
// WEBSOCKET TYPES
// ============================================================================

export interface WebSocketMessage {
  type: string;
  data: unknown;
  timestamp: string;
}

export interface UseWebSocketOptions {
  autoConnect?: boolean;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

// ============================================================================
// PICKUP LOCATION TYPES
// ============================================================================

export interface PickupLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactPerson: string;
  contactPhone: string;
  operatingHours: string;
  isActive: boolean;
}

// ============================================================================
// CART TYPES
// ============================================================================

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  imageUrl?: string;
  unit: string;
  unitSize: number;
  mrp: number;
  sellingPrice: number;
  quantity: number;
  minOrderQty: number;
  maxOrderQty?: number;
  categoryId: string;
  categoryName: string;
  orderType: 'priority' | 'group';
  groupOrderId?: string; // Only for group orders
  expiresAt?: string; // For group orders
}

export interface Cart {
  id: string;
  userId?: string; // undefined for guest carts
  sessionId?: string; // for guest carts
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  totalDiscount: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
  orderType: 'priority' | 'group';
  groupOrderId?: string;
}

export interface UpdateCartItemRequest {
  itemId: string;
  quantity: number;
}

export interface CartResponse {
  cart: Cart;
  message?: string;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
} 