/*
  Warnings:

  - Added the required column `subtotal` to the `TransactionItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TransactionItem" ADD COLUMN     "subtotal" DECIMAL(12,2) NOT NULL;
