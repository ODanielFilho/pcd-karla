/*
  Warnings:

  - The primary key for the `classrooms` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `description` on the `classrooms` table. All the data in the column will be lost.
  - You are about to drop the column `link` on the `classrooms` table. All the data in the column will be lost.
  - You are about to drop the column `module_id` on the `classrooms` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `classrooms` table. All the data in the column will be lost.
  - The `id` column on the `classrooms` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `modules` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `modules` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `trainnings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `owner_id` on the `trainnings` table. All the data in the column will be lost.
  - The `id` column on the `trainnings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `A` on the `_TrainningStudents` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `studentId` to the `classrooms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `classrooms` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `trainningId` on the `classrooms` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `teacher_id` to the `modules` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `trainningId` on the `modules` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `teacher_id` to the `trainnings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_TrainningStudents" DROP CONSTRAINT "_TrainningStudents_A_fkey";

-- DropForeignKey
ALTER TABLE "classrooms" DROP CONSTRAINT "classrooms_module_id_fkey";

-- DropForeignKey
ALTER TABLE "classrooms" DROP CONSTRAINT "classrooms_trainningId_fkey";

-- DropForeignKey
ALTER TABLE "modules" DROP CONSTRAINT "modules_trainningId_fkey";

-- DropForeignKey
ALTER TABLE "trainnings" DROP CONSTRAINT "trainnings_owner_id_fkey";

-- AlterTable
ALTER TABLE "_TrainningStudents" DROP COLUMN "A",
ADD COLUMN     "A" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "classrooms" DROP CONSTRAINT "classrooms_pkey",
DROP COLUMN "description",
DROP COLUMN "link",
DROP COLUMN "module_id",
DROP COLUMN "title",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "studentId" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "trainningId",
ADD COLUMN     "trainningId" INTEGER NOT NULL,
ADD CONSTRAINT "classrooms_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "modules" DROP CONSTRAINT "modules_pkey",
ADD COLUMN     "teacher_id" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "trainningId",
ADD COLUMN     "trainningId" INTEGER NOT NULL,
ADD CONSTRAINT "modules_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "trainnings" DROP CONSTRAINT "trainnings_pkey",
DROP COLUMN "owner_id",
ADD COLUMN     "teacher_id" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "trainnings_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "lessons" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "trainningId" INTEGER NOT NULL,
    "module_id" INTEGER NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "_TrainningStudents_AB_unique" ON "_TrainningStudents"("A", "B");

-- AddForeignKey
ALTER TABLE "trainnings" ADD CONSTRAINT "trainnings_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_trainningId_fkey" FOREIGN KEY ("trainningId") REFERENCES "trainnings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_trainningId_fkey" FOREIGN KEY ("trainningId") REFERENCES "trainnings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classrooms" ADD CONSTRAINT "classrooms_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classrooms" ADD CONSTRAINT "classrooms_trainningId_fkey" FOREIGN KEY ("trainningId") REFERENCES "trainnings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TrainningStudents" ADD CONSTRAINT "_TrainningStudents_A_fkey" FOREIGN KEY ("A") REFERENCES "trainnings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
