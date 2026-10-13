/*
  Warnings:

  - Added the required column `userId` to the `InventoryRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InventoryRequest" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "notifications" ALTER COLUMN "sessionId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "InventoryRequest_userId_status_idx" ON "InventoryRequest"("userId", "status");

-- AddForeignKey
ALTER TABLE "InventoryRequest" ADD CONSTRAINT "InventoryRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
