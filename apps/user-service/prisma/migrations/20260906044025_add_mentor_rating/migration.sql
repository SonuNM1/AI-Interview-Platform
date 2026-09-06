-- CreateTable
CREATE TABLE "public"."MentorRating" (
    "id" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MentorRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MentorRating_mentorId_idx" ON "public"."MentorRating"("mentorId");

-- CreateIndex
CREATE INDEX "MentorRating_candidateId_idx" ON "public"."MentorRating"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "MentorRating_mentorId_candidateId_key" ON "public"."MentorRating"("mentorId", "candidateId");
