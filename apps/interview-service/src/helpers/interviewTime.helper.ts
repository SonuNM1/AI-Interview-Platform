import Interview, { IInterview, InterviewStatus } from "../models/interview.model.js";
import {
  publishEvent,
  InterviewEventType,
} from "@repo/shared-rabbitmq";

export const isInterviewTimeExpired = (
  interview: IInterview,
): boolean => {
  if (!interview.startedAt) {
    return false;
  }

  const expiresAt =
    interview.startedAt.getTime() +
    interview.duration * 60 * 1000;

  return Date.now() >= expiresAt;
};

// Completes an interview after its allowed duration expires and notifies the recruiter

export const completeInterviewByTime = async (
  interview: IInterview,
) => {
  interview.status = InterviewStatus.COMPLETED;
  interview.completedAt = new Date();

  await interview.save();

  // Notify the recruiter that the interview ended because its time expired
  
  await publishEvent("interview_events", {
    type: InterviewEventType.INTERVIEW_COMPLETED,
    interviewId: interview._id.toString(),
    recruiterId: interview.createdBy,
    candidateId: interview.candidateId,
    title: interview.title,
    role: interview.role,
    completedAt: interview.completedAt,
    score: interview.score ?? 0,
  });
};