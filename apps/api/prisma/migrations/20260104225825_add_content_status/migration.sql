-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('ACTIVE', 'HIDDEN', 'DELETED');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'ACTIVE';
