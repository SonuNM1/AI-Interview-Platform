import Interview, {
  InterviewStatus,
} from "../models/interview.model.js";

import InterviewQuestion, {
  GeneratedBy,
  QuestionType,
} from "../models/interviewQuestion.model.js";

/* Creates a temporary controlled interview dataset for testing
the real AI answer evaluation pipeline*/

export const prepareEvaluationTestInterview = async (
  interviewId: string,
) => {

  // Find the interview.
  
  const interview = await Interview.findById(interviewId);

  if (!interview) {
    return {
      success: false,
      message: "Interview not found",
    };
  }

  // Reset the interview so it can be taken again.

  interview.status = InterviewStatus.PUBLISHED;
  interview.startedAt = undefined;
  interview.completedAt = undefined;
  interview.score = undefined;
  interview.expiresAt = undefined;

  // Use exactly five questions for the test.

  interview.totalQuestions = 5;

  await interview.save();

  // Remove any questions already generated for this interview.

  await InterviewQuestion.deleteMany({
    interviewId: interview._id,
  });

  const testQuestions = [
    {
      questionNumber: 1,
      question:
        "What is the difference between let, const, and var in JavaScript?",
      answer:
        "var is function-scoped and can be redeclared and reassigned. let and const are block-scoped. let can be reassigned but cannot be redeclared in the same scope, while const cannot be reassigned after initialization. let and const are also subject to the temporal dead zone before initialization.",
    },

    {
      questionNumber: 2,
      question:
        "Can you explain the JavaScript event loop and the difference between microtasks and macrotasks?",
      answer:
        "JavaScript runs synchronous code on the call stack. Asynchronous callbacks are handled outside the stack and are placed into queues when their work completes. Microtasks, such as Promise callbacks, are processed before macrotasks such as setTimeout callbacks. After the current synchronous code finishes, the event loop processes the microtask queue before moving to the next macrotask.",
    },

    {
      questionNumber: 3,
      question:
        "What is the difference between useMemo and useCallback in React?",
      answer:
        "useMemo memoizes the result of a calculation, while useCallback memoizes a function reference. useMemo is useful when an expensive calculation should not run unnecessarily, and useCallback is useful when we want to preserve a function reference, especially when passing callbacks to memoized child components.",
    },

    {
      questionNumber: 4,
      question:
        "What is middleware in Express.js and why would you use it?",
      answer:
        "Express middleware is a function that runs during the request-response lifecycle. It receives the request, response, and next function. Middleware can be used for authentication, authorization, logging, validation, error handling, and modifying request data before the request reaches the controller.",
    },

    {
      questionNumber: 5,
      question:
        "How would you design a scalable REST API for a large application?",
      answer:
        "I would separate the application into clear layers such as routes, controllers, services, and models. I would use authentication and authorization, validation, consistent error handling, pagination, caching where appropriate, database indexes, logging, monitoring, and rate limiting. For larger systems, independent services can be scaled horizontally and asynchronous work can be moved to a message queue.",
    },
  ];

  // Create questions with only the question and reference answer.
  // The candidateAnswer, score and feedback remain empty.
  const createdQuestions = await InterviewQuestion.insertMany(
    testQuestions.map((item) => ({
      interviewId: interview._id,
      questionNumber: item.questionNumber,
      question: item.question,
      type: QuestionType.TECHNICAL,
      generatedBy: GeneratedBy.AI,

      // Temporary testing field.
      // This is NOT used by the evaluator.
      testReferenceAnswer: item.answer,
    })),
  );

  return {
    success: true,
    message: "Evaluation test interview prepared successfully.",
    data: {
      interviewId: interview._id,
      accessToken: interview.accessToken,
      totalQuestions: createdQuestions.length,
    },
  };
};