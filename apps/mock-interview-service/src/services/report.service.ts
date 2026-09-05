import openai from "../providers/openai.provider.js";
import MockInterviewQuestion from "../models/mockInterviewQuestion.model.js";
import MockInterviewReport from "../models/mockInterviewReport.model.js";
import MockInterview, {
  MockInterviewStatus,
} from "../models/mockInterview.model.js";

// Returns the existing report or generates and saves a new report using all questions answered or skipped so far.

export const getOrGenerateMockInterviewReport = async (
  mockInterviewId: string,
) => {
  const existingReport = await MockInterviewReport.findOne({
    mockInterviewId,
  });

  if (existingReport) {
    return existingReport;
  }

  const report = await generateMockInterviewReport(mockInterviewId);

  const savedReport = await MockInterviewReport.create({
    mockInterviewId,
    overallScore: report.overallScore,
    strengths: report.strengths,
    weaknesses: report.weaknesses,
    summary: report.summary,
    recommendation: report.recommendation,
  });

  return savedReport;
};

/*
 * Generates the final AI report from all answered or skipped questions.
 *
 * The AI evaluates qualitative performance only. The backend calculates
 * overallScore from the stored question scores to guarantee a 0–10 value.
 */
export const generateMockInterviewReport = async (
  mockInterviewId: string,
) => {
  const questions = await MockInterviewQuestion.find({
    mockInterviewId,
  }).sort({
    questionNumber: 1,
  });

  if (!questions.length) {
    throw new Error("No interview questions found");
  }

  /*
   * Calculate the overall score on the server.
   *
   * Every question score is already on a 0–10 scale.
   * Skipped questions have score 0, so they are naturally included.
   */
  const totalScore = questions.reduce(
    (sum, question) => sum + (question.score ?? 0),
    0,
  );

  const overallScore =
    questions.length > 0
      ? totalScore / questions.length
      : 0;

  const interviewData = questions
    .map(
      (question) => `
Question ${question.questionNumber}:
${question.question}

Candidate Answer:
${question.candidateAnswer ?? "No answer"}

Score:
${question.score ?? 0}/10

Feedback:
${question.feedback ?? "No feedback"}
`,
    )
    .join("\n--------------------\n");

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL!,

    messages: [
      {
        role: "system",
        content: `
You are generating a final report for a technical mock interview.

Evaluate the candidate as a human interviewer would.

The candidate does NOT need perfect textbook answers.

Consider:
- Practical understanding
- Core conceptual understanding
- Ability to explain their thinking
- Technical accuracy
- Overall interview performance

Do not heavily penalize minor missing details.

IMPORTANT:

The backend calculates the overall score from the individual
question scores. DO NOT calculate or return an overall score.

If a question has no candidate answer, treat it as unanswered.
Do NOT interpret an unanswered question as evidence that the
candidate gave an incorrect technical answer.

Skipped questions are explicitly marked as skipped and have a score
of 0. They are already included in the backend overall score.

Evaluate the candidate fairly based on the answers that were actually given.

Return ONLY valid JSON:

{
  "strengths": [],
  "weaknesses": [],
  "summary": "",
  "recommendation": "Strong"
}

Recommendation must be one of:
Strong
Good
Needs Improvement
`,
      },
      {
        role: "user",
        content: `
Here is the complete mock interview:

${interviewData}

Generate the final interview report.
`,
      },
    ],

    response_format: {
      type: "json_object",
    },
  });

  const result = completion.choices[0]?.message?.content;

  if (!result) {
    throw new Error("Failed to generate mock interview report");
  }

  const report = JSON.parse(result);

  /*
   * Return the backend-calculated score together with the AI-generated
   * qualitative report.
   */
  return {
    overallScore: Number(overallScore.toFixed(1)),
    strengths: Array.isArray(report.strengths)
      ? report.strengths
      : [],
    weaknesses: Array.isArray(report.weaknesses)
      ? report.weaknesses
      : [],
    summary:
      typeof report.summary === "string"
        ? report.summary
        : "",
    recommendation:
      report.recommendation === "Strong" ||
      report.recommendation === "Good" ||
      report.recommendation === "Needs Improvement"
        ? report.recommendation
        : "Needs Improvement",
  };
};

// Returns the final report for a completed mock interview

export const getMockInterviewReport = async (
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

  if (mockInterview.status !== MockInterviewStatus.COMPLETED) {
    return {
      success: false,
      message: "Mock Interview is not completed yet",
    };
  }

  const report = await getOrGenerateMockInterviewReport(
    mockInterview._id.toString(),
  );

  return {
    success: true,
    data: report,
  };
};
