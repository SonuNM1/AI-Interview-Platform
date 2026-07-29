import Interview, { InterviewStatus } from "../models/interview.model.js";
import InterviewQuestion, {
  GeneratedBy,
  QuestionType,
} from "../models/interviewQuestion.model.js";
import { generateNextQuestion } from "../helpers/questionGenerator.helper.js";

export const getFirstQuestionService = async (accessToken: string) => {
  // finding interview

  const interview = await Interview.findOne({
    accessToken,
  });

  if (!interview) {
    return {
      success: false,
      message: "Interview not found",
    };
  }

  // Interview must be started

  if (interview.status !== InterviewStatus.IN_PROGRESS) {
    return {
      success: false,
      message: "Interview has not been started",
    };
  }

  // Check whether question 1 already exists

  const existingQuestion = await InterviewQuestion.findOne({
    interviewId: interview._id,
    questionNumber: 1,
  });

  if (existingQuestion) {
    return {
      success: true,
      data: existingQuestion,
    };
  }

  // first question - later this will come from AI LLM Model

  const firstQuestion = await InterviewQuestion.create({
    interviewId: interview._id,
    questionNumber: 1,
    question: "Tell me about yourself",
    type: QuestionType.HR,
    generatedBy: GeneratedBy.SYSTEM,
  });

  return {
    success: true,
    data: firstQuestion,
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

  if (interview.status !== InterviewStatus.IN_PROGRESS) {
    return {
      success: false,
      message: "Interview is not in progress",
    };
  }

  // Find Question

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
      success: false,
      message: "Answer has already been submitted",
    };
  }

  question.candidateAnswer = candidateAnswer;

  question.answerTranscript = answerTranscript;

  question.duration = duration;

  question.answeredAt = new Date();

  await question.save();

  return {
    success: true,
  };
};

export const getNextQuestionService = async (accessToken: string) => {
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

  if (interview.status !== InterviewStatus.IN_PROGRESS) {
    return {
      success: false,
      message: "Interview is not in progress",
    };
  }

  // Get last answered question

  const lastQuestion = await InterviewQuestion.findOne({
    interviewId: interview._id,
  }).sort({
    questionNumber: -1,
  });

  if (!lastQuestion) {
    return {
      success: false,
      message: "No previous question found",
    };
  }

  if (!lastQuestion.answeredAt) {
    return {
      success: false,
      message: "Please answer the current question first",
    };
  }

  // Check whether next question already exists

  const existingQuestion = await InterviewQuestion.findOne({
    interviewId: interview._id,
    questionNumber: lastQuestion.questionNumber + 1,
  });

  if (existingQuestion) {
    return {
      success: true,
      data: existingQuestion,
    };
  }

  const nextQuestionNumber = lastQuestion.questionNumber + 1;

  // interview -> Previous question -> Candidate answer -> Job role -> experience -> skills -> Gemini/OpenAI LLM -> Generated Question 

  const nextQuestionText = await  generateNextQuestion({
    interview,
    previousQuestion: lastQuestion,
    previousAnswer: lastQuestion.candidateAnswer ?? "",
  });

  const nextQuestion = await InterviewQuestion.create({
    interviewId: interview._id,
    questionNumber: nextQuestionNumber,
    question: nextQuestionText,
    type: QuestionType.TECHNICAL,
    generatedBy: GeneratedBy.SYSTEM,
  });

  return {
    success: true,
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

  const unansweredQuestion = await InterviewQuestion.findOne({
    interviewId: interview._id,
    answeredAt: {
      $exists: false,
    },
  });

  if (unansweredQuestion) {
    return {
      success: false,
      message:
        "Please answer all interview questions before finishing the interview.",
    };
  }

  // Mark interview as completed

  interview.status = InterviewStatus.COMPLETED;

  interview.completedAt = new Date();

  await interview.save();

  return {
    success: true,
  };
};
