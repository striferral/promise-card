-- AlterTable
ALTER TABLE "CardItem" ADD COLUMN     "customType" TEXT;

-- CreateIndex
CREATE INDEX "CardItem_customType_idx" ON "CardItem"("customType");
