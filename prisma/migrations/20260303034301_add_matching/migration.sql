-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "transporterId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notifiedAt" DATETIME,
    "respondedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Match_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Match_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "Transporter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Request" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "lat" REAL,
    "lng" REAL,
    "situation" TEXT,
    "evacuationScope" TEXT NOT NULL DEFAULT 'own',
    "trailerType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unmatched',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Request" ("address", "createdAt", "evacuationScope", "id", "lat", "lng", "name", "phone", "situation", "trailerType") SELECT "address", "createdAt", "evacuationScope", "id", "lat", "lng", "name", "phone", "situation", "trailerType" FROM "Request";
DROP TABLE "Request";
ALTER TABLE "new_Request" RENAME TO "Request";
CREATE TABLE "new_Transporter" (
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
    "availability" TEXT NOT NULL DEFAULT 'available',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Transporter" ("address", "availableInHours", "availableNow", "createdAt", "driveCapability", "id", "lat", "livestockTypes", "lng", "maxDistance", "name", "notes", "phone", "rigLengthFt", "stallCount", "trailerTypes") SELECT "address", "availableInHours", "availableNow", "createdAt", "driveCapability", "id", "lat", "livestockTypes", "lng", "maxDistance", "name", "notes", "phone", "rigLengthFt", "stallCount", "trailerTypes" FROM "Transporter";
DROP TABLE "Transporter";
ALTER TABLE "new_Transporter" RENAME TO "Transporter";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
