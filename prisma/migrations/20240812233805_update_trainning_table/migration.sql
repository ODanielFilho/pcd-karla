/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `trainnings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "trainnings" DROP COLUMN "imageUrl",
ADD COLUMN     "image" TEXT;
