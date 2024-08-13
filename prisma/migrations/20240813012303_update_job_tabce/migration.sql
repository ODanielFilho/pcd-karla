/*
  Warnings:

  - You are about to drop the column `slug` on the `jobs` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "jobs_slug_key";

-- AlterTable
ALTER TABLE "jobs" DROP COLUMN "slug";
