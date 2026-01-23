-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "time" TEXT,
    "timeWindow" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "region" TEXT,
    "address" TEXT,
    "petName" TEXT NOT NULL,
    "petType" TEXT NOT NULL,
    "petDetails" TEXT,
    "contactPreference" TEXT NOT NULL DEFAULT 'email',
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "caregiverId" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "adminNotes" TEXT,
    "matchScore" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("address", "adminNotes", "caregiverId", "city", "contactPreference", "createdAt", "date", "id", "matchScore", "message", "ownerId", "petDetails", "petName", "petType", "postalCode", "region", "service", "status", "time", "timeWindow", "updatedAt") SELECT "address", "adminNotes", "caregiverId", "city", "contactPreference", "createdAt", "date", "id", "matchScore", "message", "ownerId", "petDetails", "petName", "petType", "postalCode", "region", "service", "status", "time", "timeWindow", "updatedAt" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE INDEX "Booking_date_timeWindow_idx" ON "Booking"("date", "timeWindow");
CREATE INDEX "Booking_status_idx" ON "Booking"("status");
CREATE INDEX "Booking_postalCode_idx" ON "Booking"("postalCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
