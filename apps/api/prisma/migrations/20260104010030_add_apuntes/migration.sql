-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'PRIVATE', 'CLUB');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "downloadsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC';
