import Interview, { InterviewStatus } from "../models/interview.model.js";
import crypto from "crypto";
import InterviewQuestion, { GeneratedBy } from "../models/interviewQuestion.model.js";
import { generateQuestion } from "../helpers/questionGenerator.helper.js";

export const createInterviewService = async (data: any) => {
  return await Interview.create({
    ...data,
    totalQuestions: data.totalQuestions ?? 10,
  });
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

/*
 Publish Interview - an interview is first created as a DRAFT so recruiters can review and modify it. 
 
 Create Interview -> DRAFT -> Update/Delete allowd -> Publish Interview -> PUBLISH -> Candidates can now access it 
*/

// Generating a cryptographically secure token that will be used to create a public interview link for candidates

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

  interview.status = InterviewStatus.PUBLISHED;
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
  // Find interview
  const interview = await Interview.findOne({
    accessToken,
  });

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

  // -----------------------------------------
  // MARK QUESTION AS SKIPPED
  // -----------------------------------------

  question.candidateAnswer = "";
  question.answerTranscript = "";
  question.score = 0;
  question.feedback = "Question skipped by candidate";
  question.duration = 0;
  question.answeredAt = new Date();

  await question.save();

  // -----------------------------------------
  // FINAL QUESTION
  // -----------------------------------------

  if (questionNumber >= interview.totalQuestions) {
    interview.status = InterviewStatus.COMPLETED;
    interview.completedAt = new Date();

    const answeredQuestions = await InterviewQuestion.find({
      interviewId: interview._id,
      score: { $ne: null },
    });

    const totalScore = answeredQuestions.reduce(
      (sum, currentQuestion) =>
        sum + (currentQuestion.score ?? 0),
      0,
    );

    interview.score =
      answeredQuestions.length > 0
        ? totalScore / answeredQuestions.length
        : 0;

    await interview.save();

    return {
      success: true,
      interviewCompleted: true,
    };
  }

  // -----------------------------------------
  // GENERATE NEXT QUESTION
  // -----------------------------------------

  const generatedQuestion = await generateQuestion({
    interview,
    previousQuestion: question,
    previousAnswer: "",
  });

  const nextQuestion = await InterviewQuestion.create({
    interviewId: interview._id,
    questionNumber: questionNumber + 1,
    question: generatedQuestion.question,
    type: generatedQuestion.type,
    generatedBy: GeneratedBy.AI,
  });

  return {
    success: true,
    interviewCompleted: false,
    data: {
      nextQuestion,
    },
  };
};