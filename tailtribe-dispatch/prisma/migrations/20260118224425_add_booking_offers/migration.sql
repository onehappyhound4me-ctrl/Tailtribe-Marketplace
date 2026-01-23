-- CreateTable
CREATE TABLE "BookingOffer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "caregiverId" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BookingOffer_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BookingOffer_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "BookingOffer_bookingId_idx" ON "BookingOffer"("bookingId");

-- CreateIndex
CREATE INDEX "BookingOffer_caregiverId_idx" ON "BookingOffer"("caregiverId");

-- CreateIndex
CREATE UNIQUE INDEX "BookingOffer_bookingId_caregiverId_key" ON "BookingOffer"("bookingId", "caregiverId");
