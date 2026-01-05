-- CreateEnum
CREATE TYPE "SidebarItemType" AS ENUM ('AD', 'FEATURED_COURSE', 'UPCOMING_EVENT', 'EDUCATIONAL_PRODUCT');

-- CreateTable
CREATE TABLE "SidebarItem" (
    "id" TEXT NOT NULL,
    "type" "SidebarItemType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "link" TEXT,
    "imageUrl" TEXT,
    "badge" TEXT,
    "ctaLabel" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SidebarItem_pkey" PRIMARY KEY ("id")
);
