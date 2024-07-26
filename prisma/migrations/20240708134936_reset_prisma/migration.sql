/*
  Warnings:

  - You are about to drop the column `slug` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the `tokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "tokens" DROP CONSTRAINT "tokens_user_id_fkey";

-- DropIndex
DROP INDEX "jobs_slug_key";

-- AlterTable
ALTER TABLE "jobs" DROP COLUMN "slug";

-- DropTable
DROP TABLE "tokens";

-- DropEnum
DROP TYPE "TokenType";
