-- CreateTable
CREATE TABLE "OwnerRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "address" TEXT,
    "region" TEXT,
    "preferredTime" TEXT,
    "startDate" DATETIME NOT NULL,
    "recurrence" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_ADMIN',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OwnerRequest_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BookingOccurrence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "scheduledDate" DATETIME NOT NULL,
    "timeWindow" TEXT NOT NULL,
    "time" TEXT,
    "status" TEXT NOT NULL DEFAULT 'UNASSIGNED',
    "assignedCaregiverId" TEXT,
    "service" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "region" TEXT,
    "adminNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BookingOccurrence_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "OwnerRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BookingOccurrence_assignedCaregiverId_fkey" FOREIGN KEY ("assignedCaregiverId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdminDecision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminDecision_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "OwnerRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AdminDecision_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "OwnerRequest_status_idx" ON "OwnerRequest"("status");

-- CreateIndex
CREATE INDEX "OwnerRequest_service_idx" ON "OwnerRequest"("service");

-- CreateIndex
CREATE INDEX "OwnerRequest_postalCode_idx" ON "OwnerRequest"("postalCode");

-- CreateIndex
CREATE INDEX "OwnerRequest_createdAt_idx" ON "OwnerRequest"("createdAt");

-- CreateIndex
CREATE INDEX "BookingOccurrence_requestId_idx" ON "BookingOccurrence"("requestId");

-- CreateIndex
CREATE INDEX "BookingOccurrence_status_idx" ON "BookingOccurrence"("status");

-- CreateIndex
CREATE INDEX "BookingOccurrence_postalCode_idx" ON "BookingOccurrence"("postalCode");

-- CreateIndex
CREATE INDEX "BookingOccurrence_scheduledDate_timeWindow_idx" ON "BookingOccurrence"("scheduledDate", "timeWindow");

-- CreateIndex
CREATE INDEX "BookingOccurrence_assignedCaregiverId_idx" ON "BookingOccurrence"("assignedCaregiverId");

-- CreateIndex
CREATE INDEX "AdminDecision_requestId_idx" ON "AdminDecision"("requestId");

-- CreateIndex
CREATE INDEX "AdminDecision_adminId_idx" ON "AdminDecision"("adminId");
