-- AlterTable
ALTER TABLE "Promise" ADD COLUMN     "paymentChoice" TEXT DEFAULT 'later';

-- AddForeignKey
ALTER TABLE "PromiseVerificationToken" ADD CONSTRAINT "PromiseVerificationToken_promiseId_fkey" FOREIGN KEY ("promiseId") REFERENCES "Promise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
