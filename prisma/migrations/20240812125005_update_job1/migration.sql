-- DropForeignKey
ALTER TABLE "jobs" DROP CONSTRAINT "jobs_companyId_fkey";

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
