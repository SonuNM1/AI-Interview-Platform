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
      success: false,
      message: "Interview not found",
    };
  }

  // only published interviews are accessible to candidates

  if (
    interview.status !== InterviewStatus.PUBLISHED &&
    interview.status !== InterviewStatus.SCHEDULED
  ) {
    return {
      success: false,
      message: "Interview is not available",
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
  });

  if (!interview) {
    return {
      success: false,
      message: "Interview not found",
    };
  }

  // Only published/scheduled interviews can be started.
  if (
    interview.status !== InterviewStatus.PUBLISHED &&
    interview.status !== InterviewStatus.SCHEDULED
  ) {
    if (interview.status === InterviewStatus.DRAFT) {
      return {
        success: false,
        message: "Interview has not been published yet",
      };
    }

    if (interview.status === InterviewStatus.IN_PROGRESS) {
      return {
        success: false,
        message: "Interview is already in progress",
      };
    }

    if (interview.status === InterviewStatus.COMPLETED) {
      return {
        success: false,
        message: "Interview has already been completed",
      };
    }

    if (interview.status === InterviewStatus.CANCELLED) {
      return {
        success: false,
        message: "Interview has been cancelled",
      };
    }

    return {
      success: false,
      message: "Interview cannot be started",
    };
  }

  // Check link expiry.

  if (interview.expiresAt && interview.expiresAt < new Date()) {
    return {
      success: false,
      message: "Interview link has expired",
    };
  }

  // Scheduled interview must have a scheduled time.
  if (!interview.scheduledAt) {
    return {
      success: false,
      message: "Interview schedule is missing",
    };
  }

  const now = new Date();

  // Candidate is too early.
  
  if (now < interview.scheduledAt) {
    return {
      success: false,
      message: "Interview has not started yet",
      scheduledAt: interview.scheduledAt,
    };
  }

  // Prevent starting twice.
  if (interview.startedAt) {
    return {
      success: false,
      message: "Interview has already been started",
    };
  }

  // Start interview.
  interview.status = InterviewStatus.IN_PROGRESS;
  interview.startedAt = now;

  await interview.save();

  return {
    success: true,
    data: {
      interviewId: interview._id,
      startedAt: interview.startedAt,
      duration: interview.duration,
      totalQuestions: interview.totalQuestions,
    },
  };
};
