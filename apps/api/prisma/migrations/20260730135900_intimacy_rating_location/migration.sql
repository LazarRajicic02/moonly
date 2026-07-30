-- CreateEnum
CREATE TYPE "IntimacyLocation" AS ENUM ('home', 'partner', 'hotel', 'other');

-- AlterTable
ALTER TABLE "IntimacyLog" ADD COLUMN     "location" "IntimacyLocation",
ADD COLUMN     "rating" INTEGER;
