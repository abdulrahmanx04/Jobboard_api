/*
  Warnings:

  - Added the required column `updatedAt` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "availableFrom" TIMESTAMP(3),
ADD COLUMN     "expectedSalary" DECIMAL(10,2),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "resumeFileName" TEXT,
ADD COLUMN     "statusHistory" JSONB,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Application_appliedAt_idx" ON "Application"("appliedAt");
