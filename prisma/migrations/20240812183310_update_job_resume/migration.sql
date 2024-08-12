/*
  Warnings:

  - You are about to drop the `job_resume` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "job_resume" DROP CONSTRAINT "job_resume_jobId_fkey";

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "resume" TEXT[];

-- DropTable
DROP TABLE "job_resume";
