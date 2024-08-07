-- DropForeignKey
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_module_id_fkey";

-- DropForeignKey
ALTER TABLE "modules" DROP CONSTRAINT "modules_trainningId_fkey";

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_trainningId_fkey" FOREIGN KEY ("trainningId") REFERENCES "trainnings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
