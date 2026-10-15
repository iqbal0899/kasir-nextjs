-- CreateTable
CREATE TABLE "InventoryRequest" (
    "id" SERIAL NOT NULL,
    "requestId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryRequestItem" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "InventoryRequestItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InventoryRequest_requestId_key" ON "InventoryRequest"("requestId");

-- CreateIndex
CREATE INDEX "InventoryRequest_status_idx" ON "InventoryRequest"("status");

-- CreateIndex
CREATE INDEX "InventoryRequest_createdAt_idx" ON "InventoryRequest"("createdAt");

-- CreateIndex
CREATE INDEX "InventoryRequestItem_requestId_idx" ON "InventoryRequestItem"("requestId");

-- CreateIndex
CREATE INDEX "InventoryRequestItem_productId_idx" ON "InventoryRequestItem"("productId");

-- AddForeignKey
ALTER TABLE "InventoryRequestItem" ADD CONSTRAINT "InventoryRequestItem_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "InventoryRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryRequestItem" ADD CONSTRAINT "InventoryRequestItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
