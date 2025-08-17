/*
  Warnings:

  - You are about to drop the `price_change_requests` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "price_change_requests" DROP CONSTRAINT "price_change_requests_approverId_fkey";

-- DropForeignKey
ALTER TABLE "price_change_requests" DROP CONSTRAINT "price_change_requests_productId_fkey";

-- DropForeignKey
ALTER TABLE "price_change_requests" DROP CONSTRAINT "price_change_requests_requesterId_fkey";

-- DropTable
DROP TABLE "price_change_requests";

-- DropEnum
DROP TYPE "PriceChangeStatus";
