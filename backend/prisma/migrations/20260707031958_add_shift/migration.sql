-- CreateTable
CREATE TABLE "shifts" (
    "id" TEXT NOT NULL,
    "shiftName" TEXT NOT NULL,
    "shiftStart" TEXT NOT NULL,
    "shiftEnd" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shifts_shiftName_key" ON "shifts"("shiftName");

-- CreateIndex
CREATE INDEX "shifts_deletedAt_idx" ON "shifts"("deletedAt");
