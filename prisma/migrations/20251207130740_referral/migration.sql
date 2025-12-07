/*
  Warnings:

  - A unique constraint covering the columns `[referralCode]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "referralCode" TEXT,
ADD COLUMN     "referredBy" TEXT;

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "referredId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralEarning" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "referredUserId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "level" INTEGER NOT NULL,
    "plan" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "percentage" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "description" TEXT NOT NULL,
    "creditedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferralEarning_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Referral_referredId_key" ON "Referral"("referredId");

-- CreateIndex
CREATE INDEX "Referral_referrerId_idx" ON "Referral"("referrerId");

-- CreateIndex
CREATE INDEX "Referral_referredId_idx" ON "Referral"("referredId");

-- CreateIndex
CREATE INDEX "Referral_level_idx" ON "Referral"("level");

-- CreateIndex
CREATE INDEX "Referral_status_idx" ON "Referral"("status");

-- CreateIndex
CREATE INDEX "ReferralEarning_userId_idx" ON "ReferralEarning"("userId");

-- CreateIndex
CREATE INDEX "ReferralEarning_referredUserId_idx" ON "ReferralEarning"("referredUserId");

-- CreateIndex
CREATE INDEX "ReferralEarning_status_idx" ON "ReferralEarning"("status");

-- CreateIndex
CREATE INDEX "ReferralEarning_createdAt_idx" ON "ReferralEarning"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referredId_fkey" FOREIGN KEY ("referredId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralEarning" ADD CONSTRAINT "ReferralEarning_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
