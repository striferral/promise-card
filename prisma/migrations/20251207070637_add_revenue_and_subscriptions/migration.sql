-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPremium" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cardLimit" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "itemsPerCardLimit" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "subscriptionPlan" TEXT NOT NULL DEFAULT 'free';

-- CreateTable
CREATE TABLE "Revenue" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "userId" TEXT,
    "promiseId" TEXT,
    "withdrawalId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Revenue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "status" TEXT NOT NULL DEFAULT 'active',
    "amount" DOUBLE PRECISION,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Revenue_type_idx" ON "Revenue"("type");

-- CreateIndex
CREATE INDEX "Revenue_createdAt_idx" ON "Revenue"("createdAt");

-- CreateIndex
CREATE INDEX "Revenue_userId_idx" ON "Revenue"("userId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_plan_idx" ON "Subscription"("plan");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Card_isFeatured_idx" ON "Card"("isFeatured");

-- AddForeignKey
ALTER TABLE "Revenue" ADD CONSTRAINT "Revenue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
