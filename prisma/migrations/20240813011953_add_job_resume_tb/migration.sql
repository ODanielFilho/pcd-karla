/*
  Warnings:

  - You are about to drop the column `resume` on the `jobs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "jobs" DROP COLUMN "resume";

-- CreateTable
CREATE TABLE "JobResume" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "JobResume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_JobToJobResume" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_JobToJobResume_AB_unique" ON "_JobToJobResume"("A", "B");

-- CreateIndex
CREATE INDEX "_JobToJobResume_B_index" ON "_JobToJobResume"("B");

-- AddForeignKey
ALTER TABLE "_JobToJobResume" ADD CONSTRAINT "_JobToJobResume_A_fkey" FOREIGN KEY ("A") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobToJobResume" ADD CONSTRAINT "_JobToJobResume_B_fkey" FOREIGN KEY ("B") REFERENCES "JobResume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
