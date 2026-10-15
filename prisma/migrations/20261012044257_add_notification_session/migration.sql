-- AlterTable
ALTER TABLE "User"
ADD COLUMN "email" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3);

-- Populate existing users
UPDATE "User"
SET
    "email" = 'user-' || "id" || '@example.invalid',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "email" IS NULL OR "updatedAt" IS NULL;

-- Make columns required
ALTER TABLE "User"
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "href" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "sessionId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_userId_sessionId_isRead_createdAt_idx"
ON "notifications"("userId", "sessionId", "isRead", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "notifications"
ADD CONSTRAINT "notifications_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;