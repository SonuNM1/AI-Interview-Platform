import Interview, {
  IInterview,
  InterviewStatus,
} from "../models/interview.model.js";

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

export const completeInterviewByTime = async (
  interview: IInterview,
) => {
  interview.status = InterviewStatus.COMPLETED;
  interview.completedAt = new Date();

  await interview.save();
};