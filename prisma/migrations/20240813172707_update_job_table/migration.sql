/*
  Warnings:

  - You are about to drop the `_JobToJobResume` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `jobId` to the `JobResume` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_JobToJobResume" DROP CONSTRAINT "_JobToJobResume_A_fkey";

-- DropForeignKey
ALTER TABLE "_JobToJobResume" DROP CONSTRAINT "_JobToJobResume_B_fkey";

-- AlterTable
ALTER TABLE "JobResume" ADD COLUMN     "jobId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_JobToJobResume";

-- AddForeignKey
ALTER TABLE "JobResume" ADD CONSTRAINT "JobResume_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
