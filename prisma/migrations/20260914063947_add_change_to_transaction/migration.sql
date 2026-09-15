/*
  Warnings:

  - You are about to alter the column `cashReceived` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `totalAmount` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - Added the required column `change` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Made the column `cashReceived` on table `Transaction` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "change" DECIMAL(12,2) NOT NULL,
ALTER COLUMN "cashReceived" SET NOT NULL,
ALTER COLUMN "cashReceived" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(12,2);
