/*
  Warnings:

  - You are about to drop the column `productCode` on the `InventoryTransferItem` table. All the data in the column will be lost.
  - Added the required column `productId` to the `InventoryTransferItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "InventoryTransferItem_productCode_idx";

-- AlterTable
ALTER TABLE "InventoryTransferItem" DROP COLUMN "productCode",
ADD COLUMN     "productId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "InventoryProductMapping" (
    "id" SERIAL NOT NULL,
    "inventoryCode" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryProductMapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InventoryProductMapping_inventoryCode_key" ON "InventoryProductMapping"("inventoryCode");

-- CreateIndex
CREATE INDEX "InventoryProductMapping_productId_idx" ON "InventoryProductMapping"("productId");

-- CreateIndex
CREATE INDEX "InventoryTransferItem_productId_idx" ON "InventoryTransferItem"("productId");

-- AddForeignKey
ALTER TABLE "InventoryTransferItem" ADD CONSTRAINT "InventoryTransferItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryProductMapping" ADD CONSTRAINT "InventoryProductMapping_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
