-- CreateTable
CREATE TABLE "CommunityRoom" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CommunityMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roomId" TEXT NOT NULL,
    "senderUserId" TEXT NOT NULL,
    "senderRole" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sanitizedBody" TEXT,
    "blockedReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunityMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "CommunityRoom" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CommunityRoom_slug_key" ON "CommunityRoom"("slug");

-- CreateIndex
CREATE INDEX "CommunityRoom_sortOrder_idx" ON "CommunityRoom"("sortOrder");

-- CreateIndex
CREATE INDEX "CommunityMessage_roomId_idx" ON "CommunityMessage"("roomId");

-- CreateIndex
CREATE INDEX "CommunityMessage_senderUserId_idx" ON "CommunityMessage"("senderUserId");

-- CreateIndex
CREATE INDEX "CommunityMessage_createdAt_idx" ON "CommunityMessage"("createdAt");
