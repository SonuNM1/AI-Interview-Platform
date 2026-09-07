-- AddForeignKey
ALTER TABLE "public"."MentorProfile" ADD CONSTRAINT "MentorProfile_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
