-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "CommunityMessage_roomId_createdAt_idx" ON "CommunityMessage"("roomId", "createdAt");
