import { STATUS_CODES } from "http";
import Interview, {
  IInterview,
  InterviewStatus,
} from "../models/interview.model.js";

type PublicInterviewResponse =
  | {
      success: true;
      data: IInterview;
    }
  | {
      success: false;
      message: string;
    };

export const getPublicInterviewService = async (
  accessToken: string,
): Promise<PublicInterviewResponse> => {
  // finding interview using the secure public access token

  const interview = await Interview.findOne({
    accessToken,
  });

  if (!interview) {
    return {
      success: true,
      message: "Interview not found",
    };
  }

  // only published interviews are accessible to candidates

  if (interview.status !== InterviewStatus.PUBLISHED) {
    return {
      success: false,
      message: "Interview has not been published yet",
    };
  }

  // if an expiry date exists, ensure the interview link is still valid

  if (interview.expiresAt && interview.expiresAt < new Date()) {
    return {
      success: false,
      message: "Interview link has expired",
    };
  }

  return {
    success: true,
    data: interview,
  };
};

export const startInterviewService = async (accessToken: string) => {
  const interview = await Interview.findOne({
    accessToken,
  }); // finding interview using access token

  // Interview not found

  if (!interview) {
    return {
      success: false,
      message: "Interview not found",
    };
  }

  // Interview must be published

  if (interview.status === InterviewStatus.DRAFT) {
    return {
      success: false,
      message: "Interview has not been published yet",
    };
  }

  // Scheduled interview cannot be started before time

  if (interview.status === InterviewStatus.SCHEDULED) {
    return {
      success: false,
      message: "Interview has not started yet",
    };
  }

  // Already running

  if (interview.status === InterviewStatus.IN_PROGRESS) {
    return {
      success: false,
      message: "Interview is already in progress",
    };
  }

  // Already completed

  if (interview.status === InterviewStatus.COMPLETED) {
    return {
      success: false,
      message: "Interview has already been completed",
    };
  }

  // Cancelled

  if (interview.status === InterviewStatus.CANCELLED) {
    return {
      success: false,
      message: "Interview has been cancelled",
    };
  }

  // Expired

  if (interview.expiresAt && interview.expiresAt < new Date()) {
    return {
      success: false,
      message: "Interview link has expired",
    };
  }

  // preventing starting twice or multiple starts

  if (interview.startedAt) {
    return {
      success: false,
      message: "Interview has already been started",
    };
  }

  // marking interview as started

  interview.status = InterviewStatus.IN_PROGRESS;
  interview.startedAt = new Date();

  await interview.save();

  return {
    success: true,
  };
};
