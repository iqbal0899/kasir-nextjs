/*
  Warnings:

  - You are about to alter the column `image` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "image" SET DATA TYPE VARCHAR(255);
