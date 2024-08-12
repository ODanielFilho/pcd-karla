/*
  Warnings:

  - Added the required column `benefits` to the `jobs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `jobs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pay` to the `jobs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "benefits" TEXT NOT NULL,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "pay" INTEGER NOT NULL;
