/*
  Warnings:

  - The primary key for the `jobs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `jobs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `jobId` on the `applications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "applications" DROP CONSTRAINT "applications_jobId_fkey";

-- AlterTable
ALTER TABLE "applications" DROP COLUMN "jobId",
ADD COLUMN     "jobId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "jobs" DROP CONSTRAINT "jobs_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "jobs_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
