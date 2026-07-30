import Interview, { InterviewStatus } from "../models/interview.model.js";
import InterviewQuestion from "../models/interviewQuestion.model.js";
import { generateInterviewReport } from "../helpers/interviewReport.helper.js";
import InterviewReport from "../models/interviewReport.model.js";

// Generates the final interview report using all answered questions.Loads interview data, prepares AI input, and delegates report generation.

export const generateInterviewReportService = async (accessToken: string) => {
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

  // Interview should be completed

  if (interview.status !== InterviewStatus.COMPLETED) {
    return {
      success: false,
      message: "Interview is not completed yet",
    };
  }

  // loading all questions

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

  // ensuring every expected question has been answered

  const answeredQuestions = questions.filter(
    (question) =>
      question.answeredAt && question.score !== undefined && question.feedback,
  );

  if (answeredQuestions.length !== interview.totalQuestions) {
    return {
      success: false,
      message: `Interview is incomplete. Expected ${interview.totalQuestions} answered questions but found ${answeredQuestions.length}.`,
    };
  }

  const report = await generateInterviewReport({
    role: interview.role,
    experience: interview.experience,
    questions: answeredQuestions.map((question) => ({
      question: question.question,
      answer: question.candidateAnswer ?? "",
      score: question.score,
      feedback: question.feedback,
    })),
  });

  const overallScore =
    answeredQuestions.reduce(
      (sum, question) => sum + (question.score ?? 0),
      0,
    ) / answeredQuestions.length;

    // checking whether report already exists 

    const existingReport = await InterviewReport.findOne({
        interviewId: interview._id,
    })

    if(existingReport) {
        return {
            success: true, 
            data: existingReport
        }
    }

  const savedReport = await InterviewReport.create({
    interviewId: interview._id,
    overallScore,
    communicationScore: report.communicationScore,
    strengths: report.strengths,
    weaknesses: report.weaknesses,
    recommendation: report.recommendation,
    summary: report.summary 
  })

  return {
    success: true, 
    data: savedReport
  }
};
