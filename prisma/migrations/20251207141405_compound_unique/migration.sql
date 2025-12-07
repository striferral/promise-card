/*
  Warnings:

  - A unique constraint covering the columns `[referrerId,referredId,level]` on the table `Referral` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Referral_referredId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Referral_referrerId_referredId_level_key" ON "Referral"("referrerId", "referredId", "level");
