-- CreateTable
CREATE TABLE "public"."MentorProfile" (
    "id" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "monthlyMentorshipAmount" INTEGER NOT NULL,
    "mentorshipExpertise" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mentorshipEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MentorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MentorProfile_mentorId_key" ON "public"."MentorProfile"("mentorId");
