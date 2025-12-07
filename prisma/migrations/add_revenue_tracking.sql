-- Add Revenue model for tracking all platform revenue
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

-- Add Subscription model
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "status" TEXT NOT NULL DEFAULT 'active',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- Add indexes
CREATE INDEX "Revenue_type_idx" ON "Revenue"("type");
CREATE INDEX "Revenue_createdAt_idx" ON "Revenue"("createdAt");
CREATE INDEX "Revenue_userId_idx" ON "Revenue"("userId");
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");
CREATE INDEX "Subscription_plan_idx" ON "Subscription"("plan");
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- Add subscription plan to User
ALTER TABLE "User" ADD COLUMN "subscriptionPlan" TEXT DEFAULT 'free';
ALTER TABLE "User" ADD COLUMN "cardLimit" INTEGER DEFAULT 3;
ALTER TABLE "User" ADD COLUMN "itemsPerCardLimit" INTEGER DEFAULT 10;

-- Add featured and premium flags to Card
ALTER TABLE "Card" ADD COLUMN "isFeatured" BOOLEAN DEFAULT false;
ALTER TABLE "Card" ADD COLUMN "isPremium" BOOLEAN DEFAULT false;
ALTER TABLE "Card" ADD COLUMN "customTheme" TEXT;

-- Add foreign keys
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
