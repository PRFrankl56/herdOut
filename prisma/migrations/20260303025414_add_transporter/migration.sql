-- CreateTable
CREATE TABLE "Transporter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "lat" REAL,
    "lng" REAL,
    "stallCount" INTEGER NOT NULL,
    "rigLengthFt" TEXT NOT NULL,
    "trailerTypes" TEXT NOT NULL,
    "driveCapability" TEXT NOT NULL,
    "livestockTypes" TEXT NOT NULL,
    "maxDistance" TEXT NOT NULL,
    "availableNow" BOOLEAN NOT NULL,
    "availableInHours" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
