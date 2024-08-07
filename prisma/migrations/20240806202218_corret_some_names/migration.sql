/*
  Warnings:

  - You are about to drop the column `duraction` on the `trainnings` table. All the data in the column will be lost.
  - Added the required column `duration` to the `trainnings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "trainnings" DROP COLUMN "duraction",
ADD COLUMN     "duration" TEXT NOT NULL;
