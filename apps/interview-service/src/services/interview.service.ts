import Interview, { InterviewStatus } from "../models/interview.model.js";
import crypto from "crypto";
import InterviewQuestion, {
  GeneratedBy,
} from "../models/interviewQuestion.model.js";
import { generateQuestion } from "../helpers/questionGenerator.helper.js";
import { publishEvent, InterviewEventType } from "@repo/shared-rabbitmq";
import {
  isInterviewTimeExpired,
  completeInterviewByTime,
} from "../helpers/interviewTime.helper.js";

export const createInterviewService = async (data: any) => {
  const interview = await Interview.create({
    ...data,
    status: InterviewStatus.SCHEDULED,
    totalQuestions: 5,
  });

  await publishEvent("interview_events", {
    type: InterviewEventType.INTERVIEW_SCHEDULED,

    interviewId: interview._id.toString(),

    candidateId: interview.candidateId,

    title: interview.title,

    scheduledAt: interview.scheduledAt,

    duration: interview.duration,
  });

  return interview;
};

export const getInterviewByIdService = async (id: string, userId: string) => {
  console.log("Service id:", id);

  return await Interview.findOne({
    _id: id,
    createdBy: userId,
  });
};

// recruiters generally want to see the most recently created interviews first

export const getAllInterviewsService = async (userId: string) => {
  return await Interview.find({
    createdBy: userId,
  }).sort({
    createdAt: -1,
  });
};

export const updateInterviewService = async (
  id: string,
  userId: string,
  data: any,
) => {
  return await Interview.findOneAndUpdate(
    {
      _id: id,
      createdBy: userId,
    },
    data,
    {
      new: true,
      runValidators: true,
    },
  );
};

export const deleteInterviewService = async (id: string, userId: string) => {
  return await Interview.findOneAndDelete({
    _id: id,
    createdBy: userId,
  });
};

export const publishInterviewService = async (id: string, userId: string) => {
  // fetching interview first to check its current publish state

  const interview = await Interview.findOne({
    _id: id,
    createdBy: userId,
  });

  if (!interview) return null;

  // if alredy published and a token exists, reuse it instead of generating a new one

  if (interview.status === InterviewStatus.PUBLISHED && interview.accessToken) {
    return interview;
  }

  // Generating a secure, non-guessable token for the public interview link

  const accessToken = crypto.randomBytes(32).toString("hex");

  interview.status =
    interview.scheduledAt && interview.scheduledAt > new Date()
      ? InterviewStatus.SCHEDULED
      : InterviewStatus.PUBLISHED;
  interview.accessToken = accessToken;

  // optional: setting an expiry date in the future if needed

  interview.expiresAt = undefined;

  await interview.save();
  return interview;
};

// returns all interviews assigned to the authenticated candidate

export const getCandidateInterviewsService = async (candidateId: string) => {
  return await Interview.find({
    candidateId,
  }).sort({
    createdAt: -1,
  });
};

export const skipInterviewQuestionService = async (
  accessToken: string,
  questionNumber: number,
) => {
  const interview = await Interview.findOne({
    accessToken,
  }); // Find interview

  if (!interview) {
    return {
      success: false,
      message: "Interview not found",
    };
  }

  // Interview must be running

  if (interview.status !== InterviewStatus.IN_PROGRESS) {
    return {
      success: false,
      message: "Interview is not in progress",
    };
  }

  if (isInterviewTimeExpired(interview)) {
    await completeInterviewByTime(interview);

    return {
      success: false,
      interviewCompleted: true,
      message: "Interview time has expired.",
    };
  }

  // Find current question

  const question = await InterviewQuestion.findOne({
    interviewId: interview._id,
    questionNumber,
  });

  if (!question) {
    return {
      success: false,
      message: "Question not found",
    };
  }

  // Prevent duplicate skip/submission

  if (question.answeredAt) {
    return {
      success: false,
      message: "Question has already been submitted",
    };
  }

  question.candidateAnswer = "";
  question.answerTranscript = "";
  question.score = 0;
  question.feedback = "Question skipped by candidate";
  question.duration = 0;
  question.answeredAt = new Date();

  await question.save();

  if (questionNumber >= interview.totalQuestions) {
    interview.status = InterviewStatus.COMPLETED;
    interview.completedAt = new Date();

    const answeredQuestions = await InterviewQuestion.find({
      interviewId: interview._id,
      score: { $ne: null },
    });

    const totalScore = answeredQuestions.reduce(
      (sum, currentQuestion) => sum + (currentQuestion.score ?? 0),
      0,
    );

    interview.score =
      answeredQuestions.length > 0 ? totalScore / answeredQuestions.length : 0;

    await interview.save();

    return {
      success: true,
      interviewCompleted: true,
    };
  }

  return {
    success: true,
    interviewCompleted: false,
  };
};
