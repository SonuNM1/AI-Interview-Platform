import Interview, { InterviewStatus } from "../models/interview.model.js";
import InterviewQuestion, {
  GeneratedBy,
  QuestionType,
} from "../models/interviewQuestion.model.js";
import {
  evaluateCandidateAnswer,
  generateQuestion,
} from "../helpers/questionGenerator.helper.js";
import {
  isInterviewTimeExpired,
  completeInterviewByTime,
} from "../helpers/interviewTime.helper.js";
import { publishEvent, InterviewEventType } from "@repo/shared-rabbitmq";
import { ensureInterviewReportService } from "./interviewReport.service.js";

export const getFirstQuestionService = async (accessToken: string) => {
  const interview = await Interview.findOne({
    accessToken,
  });

  if (!interview) {
    return {
      success: false,
      message: "Interview not found",
    };
  }

  if (interview.status !== InterviewStatus.IN_PROGRESS) {
    return {
      success: false,
      message: "Interview has not been started",
    };
  }

  // If there is an unanswered question, return the earliest one.
  // This allows the candidate to recover correctly after a refresh.
  const unansweredQuestion = await InterviewQuestion.findOne({
    interviewId: interview._id,
    answeredAt: { $exists: false },
  }).sort({
    questionNumber: 1,
  });

  if (unansweredQuestion) {
    return {
      success: true,
      data: unansweredQuestion,
    };
  }

  // If Q1 already exists and there are no unanswered questions,
  // do NOT generate another Q1.
  const firstQuestion = await InterviewQuestion.findOne({
    interviewId: interview._id,
    questionNumber: 1,
  });

  if (firstQuestion) {
    return {
      success: false,
      message: "No unanswered question remains",
    };
  }

  // Only generate Q1 when no question exists yet.
  const generatedQuestion = await generateQuestion({
    interview,
  });

  const createdQuestion = await InterviewQuestion.create({
    interviewId: interview._id,
    questionNumber: 1,
    question: generatedQuestion.question,
    type: generatedQuestion.type,
    generatedBy: GeneratedBy.AI,
  });

  return {
    success: true,
    data: createdQuestion,
  };
};

export const submitCandidateAnswerService = async (
  accessToken: string,
  questionNumber: number,
  candidateAnswer: string,
  answerTranscript: string,
  duration: number,
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

  // Complete the interview if its time has expired.
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

  // Prevent duplicate submission
  if (question.answeredAt) {
    return {
      success: true,
      alreadySubmitted: true,
      data: {
        transcript: question.answerTranscript ?? "",
        score: question.score ?? 0,
        feedback: question.feedback ?? "",
      },
    };
  }

  // Save candidate answer
  question.candidateAnswer = candidateAnswer;
  question.answerTranscript = answerTranscript;
  question.duration = duration;
  question.answeredAt = new Date();

  // Evaluate answer using AI.
  const evaluation = await evaluateCandidateAnswer({
    question: question.question,
    candidateAnswer,
  });

  // Save AI evaluation.
  question.score = evaluation.score;
  question.feedback = evaluation.feedback;

  await question.save();

  // Final question: complete the interview after the answer
  // has been evaluated and saved.
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
  answeredQuestions.length > 0
    ? totalScore / answeredQuestions.length
    : 0;

    await interview.save();

    // generate the final recruiter report after the interview has been completed and the finnal answer has been evaluated 

    await ensureInterviewReportService(interview) ; 

    // Notify the recruiter after the final answer has been evaluated and the interview has been completed

    await publishEvent("interview_events", {
      type: InterviewEventType.INTERVIEW_COMPLETED,
      interviewId: interview._id.toString(),
      recruiterId: interview.createdBy,
      candidateId: interview.candidateId,
      title: interview.title,
      role: interview.role,
      completedAt: interview.completedAt,
      score: interview.score,
    });

    return {
      success: true,
      interviewCompleted: true,
      data: {
        transcript: answerTranscript,
        score: evaluation.score,
        feedback: evaluation.feedback,
      },
    };
  }

  // Update current interview score.
  const answeredQuestions = await InterviewQuestion.find({
    interviewId: interview._id,
    score: { $ne: null },
  });

  const totalScore = answeredQuestions.reduce(
    (sum, currentQuestion) => sum + (currentQuestion.score ?? 0),
    0,
  );

  interview.score =
    answeredQuestions.length > 0
      ? totalScore / answeredQuestions.length
      : 0;

  await interview.save();

  // The frontend generates the next question separately.
  return {
    success: true,
    interviewCompleted: false,
    data: {
      transcript: answerTranscript,
      score: evaluation.score,
      feedback: evaluation.feedback,
    },
  };
};

export const getNextQuestionService = async (accessToken: string) => {
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

  if (interview.status !== InterviewStatus.IN_PROGRESS) {
    return {
      success: false,
      message: "Interview is not in progress",
    };
  }

  if (isInterviewTimeExpired(interview)) {
    await completeInterviewByTime(interview);

    return {
      success: true,
      interviewCompleted: true,
    };
  }

  const lastAnsweredQuestion = await InterviewQuestion.findOne({
    interviewId: interview._id,
    answeredAt: { $exists: true },
  }).sort({
    questionNumber: -1,
  });

  if (!lastAnsweredQuestion) {
    return {
      success: false,
      message: "No answered question found",
    };
  }

  // If the last answered question is the final question,
  // the interview is complete.

  if (lastAnsweredQuestion.questionNumber >= interview.totalQuestions) {
    interview.status = InterviewStatus.COMPLETED;
    interview.completedAt = new Date();

    await interview.save();

    // ensure a report exists even if this completion path is reached after the final question 

    await ensureInterviewReportService(interview) ; 

    return {
      success: true,
      interviewCompleted: true,
    };
  }

  const nextQuestionNumber = lastAnsweredQuestion.questionNumber + 1;

  // Check whether the next question was already generated.
  //
  // This is important for refreshes/retries.
  const existingNextQuestion = await InterviewQuestion.findOne({
    interviewId: interview._id,
    questionNumber: nextQuestionNumber,
  });

  if (existingNextQuestion) {
    return {
      success: true,
      interviewCompleted: false,
      data: existingNextQuestion,
    };
  }

  // Generate the next question.
  const generatedQuestion = await generateQuestion({
    interview,
    previousQuestion: lastAnsweredQuestion,
    previousAnswer: lastAnsweredQuestion.candidateAnswer ?? "",
  });

  // Save the generated question.
  const nextQuestion = await InterviewQuestion.create({
    interviewId: interview._id,
    questionNumber: nextQuestionNumber,
    question: generatedQuestion.question,
    type: generatedQuestion.type,
    generatedBy: GeneratedBy.AI,
  });

  return {
    success: true,
    interviewCompleted: false,
    data: nextQuestion,
  };
};

/* Completes the interview after the candidate finishes answering all questions. Marks the interview as completed and prevents any further questions or answers. Later this API will also trigger AI evaluation and report generation.
 */

export const submitInterviewService = async (accessToken: string) => {
  // Find Interview

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

  // Check whether any question is left unanswered

  const answeredQuestions = await InterviewQuestion.find({
    interviewId: interview._id,
    answeredAt: { $exists: true },
    score: { $ne: null },
  });

  const totalScore = answeredQuestions.reduce(
    (sum, question) => sum + (question.score ?? 0),
    0,
  );

  interview.score =
    answeredQuestions.length > 0 ? totalScore / answeredQuestions.length : 0;

  interview.status = InterviewStatus.COMPLETED;
  interview.completedAt = new Date();

  await interview.save();

  // generate the recruiter report even if the candidate ended the interview before answering all questions 

  await ensureInterviewReportService(interview) ; 

  // Notify the recruiter that the candidate has completed the interview.

  await publishEvent("interview_events", {
    type: InterviewEventType.INTERVIEW_COMPLETED,
    interviewId: interview._id.toString(),
    recruiterId: interview.createdBy,
    candidateId: interview.candidateId,
    title: interview.title,
    role: interview.role,
    completedAt: interview.completedAt,
    score: interview.score,
  });

  return {
    success: true,
    score: interview.score ?? 0,
  };
};
