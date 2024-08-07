-- DropForeignKey
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_trainningId_fkey";

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_trainningId_fkey" FOREIGN KEY ("trainningId") REFERENCES "trainnings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
