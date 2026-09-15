/*
  Warnings:

  - You are about to drop the column `change` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `Transaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[idempotencyKey]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `idempotencyKey` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "change",
DROP COLUMN "total",
ADD COLUMN     "idempotencyKey" TEXT NOT NULL,
ADD COLUMN     "totalAmount" DECIMAL(65,30) NOT NULL,
ALTER COLUMN "cashReceived" DROP NOT NULL,
ALTER COLUMN "cashReceived" SET DATA TYPE DECIMAL(65,30);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_idempotencyKey_key" ON "Transaction"("idempotencyKey");
