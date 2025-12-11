-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "credits" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "trialEndsAt" TIMESTAMP(3);
