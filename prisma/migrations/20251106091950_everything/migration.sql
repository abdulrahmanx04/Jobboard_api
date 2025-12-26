/*
  Warnings:

  - The values [ENTRY_LEVEL,MID_LEVEL] on the enum `ExperienceLevel` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ExperienceLevel_new" AS ENUM ('ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE');
ALTER TABLE "Job" ALTER COLUMN "experienceLevel" TYPE "ExperienceLevel_new" USING ("experienceLevel"::text::"ExperienceLevel_new");
ALTER TYPE "ExperienceLevel" RENAME TO "ExperienceLevel_old";
ALTER TYPE "ExperienceLevel_new" RENAME TO "ExperienceLevel";
DROP TYPE "public"."ExperienceLevel_old";
COMMIT;
