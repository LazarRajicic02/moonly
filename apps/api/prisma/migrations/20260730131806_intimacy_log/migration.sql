-- CreateTable
CREATE TABLE "IntimacyLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "protected" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntimacyLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IntimacyLog_userId_date_idx" ON "IntimacyLog"("userId", "date");

-- AddForeignKey
ALTER TABLE "IntimacyLog" ADD CONSTRAINT "IntimacyLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
