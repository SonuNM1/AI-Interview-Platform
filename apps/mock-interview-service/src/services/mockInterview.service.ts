
import MockInterview, {
  MockInterviewStatus,
} from "../models/mockInterview.model.js";
import MockInterviewReport from "../models/mockInterviewReport.model.js";
import { generateNextQuestion } from "./question.service.js";
import { evaluateAnswer } from "./evaluation.service.js";
import MockInterviewQuestion from "../models/mockInterviewQuestion.model.js";
import {
  generateMockInterviewReport,
  getOrGenerateMockInterviewReport,
} from "./report.service.js";

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

// Submits an answer, evaluates it, and generates the next question safely

export const submitMockInterviewAnswerService = async (
  mockInterviewId: string,
  userId: string,
  answer: string,
  answerTranscript?: string,
  duration?: number,
) => {
  // Find the mock interview.

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

  // The interview must currently be running

  if (mockInterview.status !== MockInterviewStatus.IN_PROGRESS) {
    return {
      success: false,
      message: "Mock interview is not in progress",
    };
  }

  // Find the question currently being answered

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

  const claimedQuestion = await MockInterviewQuestion.findOneAndUpdate(
    {
      _id: currentQuestion._id,
      answeredAt: { $exists: false },
      answerProcessing: false,
    },
    {
      $set: {
        answerProcessing: true,
      },
    },
    {
      new: true,
    },
  );

  // Another request already submitted or is currently processing this answer.

  if (!claimedQuestion) {
    return {
      success: false,
      message:
        "Answer is already being processed or has already been submitted",
    };
  }

  try {
    // Evaluate the candidate's answer using OpenAI.
    const evaluation = await evaluateAnswer(claimedQuestion.question, answer);

    // If this is the final question, generate the report before
    // marking the interview as completed.
    if (mockInterview.currentQuestion >= mockInterview.totalQuestions) {
      // Save the candidate's answer and evaluation first.
      claimedQuestion.candidateAnswer = answer;
      claimedQuestion.answerTranscript = answerTranscript;
      claimedQuestion.duration = duration;
      claimedQuestion.score = evaluation.score;
      claimedQuestion.feedback = evaluation.feedback;
      claimedQuestion.answeredAt = new Date();
      claimedQuestion.answerProcessing = false;

      await claimedQuestion.save();

      const savedReport = await getOrGenerateMockInterviewReport(
        mockInterview._id.toString(),
      );

      // Only mark the interview completed after the report succeeds

      mockInterview.status = MockInterviewStatus.COMPLETED;
      mockInterview.completedAt = new Date();

      await mockInterview.save();

      return {
        success: true,
        interviewCompleted: true,
        data: {
          evaluation,
          report: savedReport,
        },
      };
    }

    // Generate the next question before permanently completing
    // the current question.
    //
    // If RAG/OpenAI fails here, the current question remains
    // answerProcessing=true and will be reset in the catch block.
    const nextQuestionNumber = mockInterview.currentQuestion + 1;

    const nextQuestionText = await generateNextQuestion(
      mockInterview.documentId.toString(),
      nextQuestionNumber,
    );

    // Save the current answer only after the next question
    // has been successfully generated.

    claimedQuestion.candidateAnswer = answer;
    claimedQuestion.answerTranscript = answerTranscript;
    claimedQuestion.duration = duration;
    claimedQuestion.score = evaluation.score;
    claimedQuestion.feedback = evaluation.feedback;
    claimedQuestion.answeredAt = new Date();
    claimedQuestion.answerProcessing = false;

    await claimedQuestion.save();

    // Save the newly generated question.
    const nextQuestion = await MockInterviewQuestion.create({
      mockInterviewId: mockInterview._id,
      questionNumber: nextQuestionNumber,
      question: nextQuestionText,
    });

    // Move the interview to the next question.
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
  } catch (error) {
    // If OpenAI/RAG fails, release the processing lock. The candidate's answer is NOT marked as answered, so the request can safely be retried.

    await MockInterviewQuestion.updateOne(
      {
        _id: claimedQuestion._id,
      },
      {
        $set: {
          answerProcessing: false,
        },
      },
    );

    throw error;
  }
};

export const getMockInterviewService = async (
  mockInterviewId: string,
  userId: string,
) => {
  const mockInterview = await MockInterview.findOne({
    _id: mockInterviewId,
    userId,
  });

  if (!mockInterview) {
    return {
      success: false,
      message: "Mock Interview not found",
    };
  }

  const questions = await MockInterviewQuestion.find({
    mockInterviewId: mockInterview._id,
  }).sort({
    questionNumber: 1,
  });

  const report = await MockInterviewReport.findOne({
    mockInterviewId: mockInterview._id,
  });

  return {
    success: true,
    data: {
      mockInterview,
      questions,
      report,
    },
  };
};

// Skips the current question, records it as a zero-score response, and moves the mock interview to the next question.

export const skipMockInterviewQuestionService = async (
  mockInterviewId: string,
  userId: string,
) => {
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

  if (mockInterview.status !== MockInterviewStatus.IN_PROGRESS) {
    return {
      success: false,
      message: "Mock interview is not in progress",
    };
  }

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

  // Prevent skipping an already answered question.
  if (currentQuestion.answeredAt) {
    return {
      success: false,
      message: "Question has already been answered",
    };
  }

  currentQuestion.candidateAnswer = "Skipped";
  currentQuestion.answerTranscript = "";
  currentQuestion.score = 0;
  currentQuestion.feedback = "Question skipped by candidate.";
  currentQuestion.answeredAt = new Date();
  currentQuestion.answerProcessing = false;

  await currentQuestion.save();

  // If this was the final question, complete the interview and generate the final report.

  if (mockInterview.currentQuestion >= mockInterview.totalQuestions) {
    const answeredQuestions = await MockInterviewQuestion.find({
      mockInterviewId: mockInterview._id,
      answeredAt: { $exists: true },
    });

    const totalScore = answeredQuestions.reduce(
      (sum, question) => sum + (question.score ?? 0),
      0,
    );

    mockInterview.score =
      answeredQuestions.length > 0 ? totalScore / answeredQuestions.length : 0;

    mockInterview.status = MockInterviewStatus.COMPLETED;
    mockInterview.completedAt = new Date();

    await mockInterview.save();

    const report = await getOrGenerateMockInterviewReport(
      mockInterview._id.toString(),
    );

    return {
      success: true,
      interviewCompleted: true,
      data: {
        skipped: true,
        report,
      },
    };
  }

  const nextQuestionNumber = mockInterview.currentQuestion + 1;

  const nextQuestionText = await generateNextQuestion(
    mockInterview.documentId.toString(),
    nextQuestionNumber,
  );

  const nextQuestion = await MockInterviewQuestion.create({
    mockInterviewId: mockInterview._id,
    questionNumber: nextQuestionNumber,
    question: nextQuestionText,
  });

  mockInterview.currentQuestion = nextQuestionNumber;

  await mockInterview.save();

  return {
    success: true,
    interviewCompleted: false,
    data: {
      skipped: true,
      nextQuestion,
    },
  };
};

// Manually ends the mock interview at any point and generates a report using all answered or skipped questions so far

export const endMockInterviewService = async (
  mockInterviewId: string,
  userId: string,
) => {
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

  if (mockInterview.status === MockInterviewStatus.COMPLETED) {
    const report = await getOrGenerateMockInterviewReport(
      mockInterview._id.toString(),
    );

    return {
      success: true,
      interviewCompleted: true,
      data: {
        report,
      },
    };
  }

  if (mockInterview.status !== MockInterviewStatus.IN_PROGRESS) {
    return {
      success: false,
      message: "Mock interview is not in progress",
    };
  }

  const answeredQuestions = await MockInterviewQuestion.find({
    mockInterviewId: mockInterview._id,
    answeredAt: { $exists: true },
  });

  const totalScore = answeredQuestions.reduce(
    (sum, question) => sum + (question.score ?? 0),
    0,
  );

  mockInterview.score =
    answeredQuestions.length > 0
      ? totalScore / answeredQuestions.length
      : 0;

  mockInterview.status = MockInterviewStatus.COMPLETED;
  mockInterview.completedAt = new Date();

  await mockInterview.save();

  const report = await getOrGenerateMockInterviewReport(
    mockInterview._id.toString(),
  );

  return {
    success: true,
    interviewCompleted: true,
    data: {
      report,
    },
  };
};

// Returns the user's previous mock interviews for the history page

export const getMockInterviewHistoryService = async (
  userId: string,
) => {
  const interviews = await MockInterview.find({
    userId,
  }).sort({
    createdAt: -1,
  });

  return {
    success: true,
    data: interviews,
  };
};