import axios from "axios";
import MockInterview, {
  MockInterviewStatus,
} from "../models/mockInterview.model.js";
import MockInterviewReport from "../models/mockInterviewReport.model.js";
import { generateNextQuestion } from "./question.service.js";
import { evaluateAnswer } from "./evaluation.service.js";
import MockInterviewQuestion from "../models/mockInterviewQuestion.model.js";
import { generateMockInterviewReport } from "./report.service.js";
import mockInterviewModel from "../models/mockInterview.model.js";

// Creates a new mock interview using the user's uploaded resume.

export const createMockInterviewService = async (
  userId: string,
  documentId: string,
) => {
  // Create the mock interview and associate it with the uploaded resume.

  const mockInterview = await MockInterview.create({
    userId,
    documentId,
    status: MockInterviewStatus.READY,
    totalQuestions: 5,
    currentQuestion: 0,
  });

  return mockInterview;
};

// Submit the candidate's transcribed voice answer after verifying ownership 

export const startMockInterviewService = async (
  mockInterviewId: string,
  userId: string,
) => {

  // Find the mock interview belonging to the authenticated user.
  
  const mockInterview = await MockInterview.findOne({
    _id: mockInterviewId,
    userId,
  });

  if (!mockInterview) {
    return {
      success: false,
      message: "Mock interview not found",
    };
  }

  // Prevent starting an already running interview.
  
  if (mockInterview.status === MockInterviewStatus.IN_PROGRESS) {
    return {
      success: false,
      message: "Mock interview is already in progress",
    };
  }

  // Prevent restarting a completed interview.
  
  if (mockInterview.status === MockInterviewStatus.COMPLETED) {
    return {
      success: false,
      message: "Mock interview has already been completed",
    };
  }

  // Generate the first question from the user's resume.
  
  const question = await generateNextQuestion(
    mockInterview.documentId.toString(),
    1,
  );

  // Save the generated question.
  
  const savedQuestion = await MockInterviewQuestion.create({
    mockInterviewId: mockInterview._id,
    questionNumber: 1,
    question,
  });

  // Mark the mock interview as started.
  
  mockInterview.status = MockInterviewStatus.IN_PROGRESS;
  mockInterview.currentQuestion = 1;
  mockInterview.startedAt = new Date();

  await mockInterview.save();

  return {
    success: true,
    data: {
      mockInterview,
      question: savedQuestion,
    },
  };
};

// Submits an answer, evaluates it, and generates the next question.

export const submitMockInterviewAnswerService = async (
  mockInterviewId: string,
  answer: string,
  answerTranscript?: string,
  duration?: number,
) => {
  // Find mock interview

  const mockInterview = await MockInterview.findById(mockInterviewId);

  if (!mockInterview) {
    return {
      success: false,
      message: "Mock interview not found",
    };
  }

  if (mockInterview.status !== MockInterviewStatus.IN_PROGRESS) {
    return {
      success: false,
      message: "Mock interview is not in progress",
    };
  }

  // Find current question

  const currentQuestion = await MockInterviewQuestion.findOne({
    mockInterviewId: mockInterview._id,
    questionNumber: mockInterview.currentQuestion,
  });

  if (!currentQuestion) {
    return {
      success: false,
      message: "Current question not found",
    };
  }

  // Prevent duplicate answer submission

  if (currentQuestion.answeredAt) {
    return {
      success: false,
      message: "Answer has already been submitted",
    };
  }

  // Evaluate candidate answer

  const evaluation = await evaluateAnswer(currentQuestion.question, answer);

  // Save candidate answer

  currentQuestion.candidateAnswer = answer;
  currentQuestion.answerTranscript = answerTranscript;
  currentQuestion.duration = duration;
  currentQuestion.score = evaluation.score;
  currentQuestion.feedback = evaluation.feedback;

  currentQuestion.answeredAt = new Date();

  await currentQuestion.save();

  // Check whether all questions are completed

  if (mockInterview.currentQuestion >= mockInterview.totalQuestions) {
    // Mark interview as completed
    mockInterview.status = MockInterviewStatus.COMPLETED;
    mockInterview.completedAt = new Date();

    await mockInterview.save();

    // Check if report already exists
    const existingReport = await MockInterviewReport.findOne({
      mockInterviewId: mockInterview._id,
    });

    if (existingReport) {
      return {
        success: true,
        interviewCompleted: true,
        data: {
          report: existingReport,
        },
      };
    }

    // Generate final report
    const report = await generateMockInterviewReport(
      mockInterview._id.toString(),
    );

    // Save final report
    const savedReport = await MockInterviewReport.create({
      mockInterviewId: mockInterview._id,
      overallScore: report.overallScore,
      strengths: report.strengths,
      weaknesses: report.weaknesses,
      summary: report.summary,
      recommendation: report.recommendation,
    });

    return {
      success: true,
      interviewCompleted: true,
      data: {
        evaluation,
        report: savedReport,
      },
    };
  }

  // Generate the next question

  const nextQuestionNumber = mockInterview.currentQuestion + 1;

  const nextQuestionText = await generateNextQuestion(
    mockInterview.documentId.toString(),
    nextQuestionNumber,
  );

  // Save next question

  const nextQuestion = await MockInterviewQuestion.create({
    mockInterviewId: mockInterview._id,
    questionNumber: nextQuestionNumber,
    question: nextQuestionText,
  });

  // Move interview to next question

  mockInterview.currentQuestion = nextQuestionNumber;

  await mockInterview.save();

  return {
    success: true,
    interviewCompleted: false,
    data: {
      evaluation: {
        score: evaluation.score,
        feedback: evaluation.feedback,
      },
      nextQuestion,
    },
  };
};


export const getMockInterviewService = async (
  mockInterviewId: string, 
  userId: string 
) => {
  const mockInterview = await MockInterview.findOne({
    _id: mockInterviewId, 
    userId 
  })

  if(!mockInterview) {
    return {
      success: false, 
      message: "Mock Interview not found"
    }
  }

  const questions = await MockInterviewQuestion.find({
    mockInterviewId: mockInterview._id, 
  }).sort({
    questionNumber: 1 
  })

  const report = await MockInterviewReport.findOne({
    mockInterviewId: mockInterview._id 
  }) ; 
  
  return {
    success: true, 
    data: {
      mockInterview, 
      questions, 
      report 
    }
  }

}