/*
  Warnings:

  - The `paymentMethod` column on the `orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `paymentMethod` on the `payments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'UPI', 'NETBANKING', 'WALLET', 'CASH_ON_DELIVERY');

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'CASH_ON_DELIVERY';

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "paymentMethod",
ADD COLUMN     "paymentMethod" "PaymentMethod";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "paymentMethod",
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL,
ALTER COLUMN "gatewayProvider" DROP NOT NULL;
