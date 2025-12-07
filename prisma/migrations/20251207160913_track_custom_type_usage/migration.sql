-- CreateTable
CREATE TABLE "CustomTypeUsage" (
    "id" TEXT NOT NULL,
    "typeName" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomTypeUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomTypeUsage_usageCount_idx" ON "CustomTypeUsage"("usageCount");

-- CreateIndex
CREATE UNIQUE INDEX "CustomTypeUsage_typeName_key" ON "CustomTypeUsage"("typeName");
