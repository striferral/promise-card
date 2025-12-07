-- AlterTable
ALTER TABLE "User" ADD COLUMN     "paystackRecipientCode" TEXT,
ADD COLUMN     "recipientCreatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Withdrawal" ADD COLUMN     "transferCode" TEXT;

-- CreateIndex
CREATE INDEX "Withdrawal_transferCode_idx" ON "Withdrawal"("transferCode");
