-- AlterEnum
ALTER TYPE "public"."RoleType" ADD VALUE 'MENTOR';

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "deletedAt" TIMESTAMP(3);
