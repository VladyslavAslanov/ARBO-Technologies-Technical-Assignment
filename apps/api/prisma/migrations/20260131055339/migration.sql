-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deviceId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TreeDefectRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "defectType" TEXT NOT NULL,
    "severity" INTEGER NOT NULL,
    "note" TEXT,
    "lat" REAL,
    "lng" REAL,
    "locationAccuracy" REAL,
    "recordedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TreeDefectRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecordPhoto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recordId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecordPhoto_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "TreeDefectRecord" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_deviceId_key" ON "User"("deviceId");

-- CreateIndex
CREATE INDEX "TreeDefectRecord_userId_createdAt_idx" ON "TreeDefectRecord"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "TreeDefectRecord_userId_severity_idx" ON "TreeDefectRecord"("userId", "severity");

-- CreateIndex
CREATE INDEX "TreeDefectRecord_userId_defectType_idx" ON "TreeDefectRecord"("userId", "defectType");

-- CreateIndex
CREATE INDEX "RecordPhoto_recordId_idx" ON "RecordPhoto"("recordId");
