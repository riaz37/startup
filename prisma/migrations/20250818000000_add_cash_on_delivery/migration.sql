-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'UPI', 'NETBANKING', 'WALLET', 'CASH_ON_DELIVERY');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'CASH_ON_DELIVERY');

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "paymentMethod" TYPE "PaymentMethod" USING "paymentMethod"::"PaymentMethod";

-- AlterTable
ALTER TABLE "payments" 
ALTER COLUMN "paymentMethod" TYPE "PaymentMethod" USING "paymentMethod"::"PaymentMethod",
ALTER COLUMN "gatewayProvider" DROP NOT NULL;

-- DropEnum
DROP TYPE "PaymentStatus_old";

-- DropEnum
DROP TYPE "PaymentMethod_old"; 