/*
  Warnings:

  - Added the required column `price` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BANNED', 'PENDING', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AnalyticsEventType" AS ENUM ('USER_LOGIN', 'USER_LOGOUT', 'USER_REGISTERED', 'PRODUCT_VIEWED', 'CART_VIEWED', 'CART_ITEM_ADDED', 'CART_ITEM_REMOVED', 'ORDER_PLACED', 'ORDER_CONFIRMED', 'ORDER_CANCELLED', 'ORDER_DELIVERED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'PRIORITY_ORDER_PLACED', 'PRIORITY_ORDER_CONFIRMED', 'PRIORITY_ORDER_CANCELLED', 'PRIORITY_ORDER_DELIVERED', 'REVIEW_SUBMITTED', 'NOTIFICATION_VIEWED', 'SETTINGS_UPDATED', 'DISCOUNT_CONFIG_UPDATED', 'PRODUCT_PRICE_UPDATED', 'PRICE_ALERT_TRIGGERED', 'ANALYTICS_EVENT_CUSTOM');

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "total" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "eventType" "AnalyticsEventType" NOT NULL,
    "eventData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);
