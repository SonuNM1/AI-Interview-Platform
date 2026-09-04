import Interview, {
  IInterview,
  InterviewStatus,
} from "../models/interview.model.js";
import InterviewQuestion from "../models/interviewQuestion.model.js";
import { generateInterviewReport } from "../helpers/interviewReport.helper.js";
import InterviewReport from "../models/interviewReport.model.js";

/* Ensures that a completed interview has a recruiter report. This function is used by the different interview completion paths:
 
  - Candidate finishes all questions

  - Candidate manually ends the interview

  - Interview reaches the time limit
 */

export const ensureInterviewReportService = async (
  interview: IInterview,
) => {
  // Prevent duplicate report generation.
  const existingReport = await InterviewReport.findOne({
    interviewId: interview._id,
  });

  if (existingReport) {
    return {
      success: true,
      data: existingReport,
    };
  }

  // Load all questions belonging to this interview.
  const questions = await InterviewQuestion.find({
    interviewId: interview._id,
  }).sort({
    questionNumber: 1,
  });

  if (!questions.length) {
    return {
      success: false,
      message: "No interview questions found",
    };
  }

  // Only questions that were actually answered can contribute to the report.
  const answeredQuestions = questions.filter(
    (question) =>
      question.answeredAt &&
      question.score !== undefined &&
      question.score !== null,
  );

  /*
   * Candidate ended the interview without answering anything.
   *
   * There is no candidate response for the AI to evaluate, so we create
   * a deterministic zero-score report instead of calling the AI provider.
   */
  if (answeredQuestions.length === 0) {
    const savedReport = await InterviewReport.create({
      interviewId: interview._id,
      overallScore: 0,
      communicationScore: 0,
      strengths: [],
      weaknesses: [
        "Candidate closed the interview before answering any questions.",
      ],
      recommendation: "Reject",
      summary:
        "Candidate closed the interview before completing the interview.",
    });

    return {
      success: true,
      data: savedReport,
    };
  }

  // Generate an AI report from the questions the candidate actually answered.
  const report = await generateInterviewReport({
    role: interview.role,
    experience: interview.experience,
    questions: answeredQuestions.map((question) => ({
      question: question.question,
      answer: question.candidateAnswer ?? "",
      score: question.score ?? 0,
      feedback: question.feedback ?? "",
    })),
  });

  // Overall score is the average of the answered questions.
  const overallScore =
    answeredQuestions.reduce(
      (sum, question) => sum + (question.score ?? 0),
      0,
    ) / answeredQuestions.length;

  const savedReport = await InterviewReport.create({
    interviewId: interview._id,
    overallScore,
    communicationScore: report.communicationScore,
    strengths: report.strengths,
    weaknesses: report.weaknesses,
    recommendation: report.recommendation,
    summary: report.summary,
  });

  return {
    success: true,
    data: savedReport,
  };
};

// Generates the final interview report using the questions answered by the candidate. Supports both fully completed interviews and interviews ended early by the candidate.

export const generateInterviewReportService = async (
  accessToken: string,
) => {
  // Find the interview using the candidate's secure access token.
  const interview = await Interview.findOne({
    accessToken,
  });

  if (!interview) {
    return {
      success: false,
      message: "Interview not found",
    };
  }

  if (interview.status !== InterviewStatus.COMPLETED) {
    return {
      success: false,
      message: "Interview is not completed yet",
    };
  }

  const existingReport = await InterviewReport.findOne({
    interviewId: interview._id,
  });

  if (existingReport) {
    return {
      success: true,
      data: existingReport,
    };
  }

  try {
    const result = await ensureInterviewReportService(interview);

    return result;
  } catch (error) {
    console.error(
      `Failed to generate interview report for ${interview._id}:`,
      error,
    );

    return {
      success: false,
      reportGenerationFailed: true,
      message: "Interview completed, but report generation failed",
    };
  }
};