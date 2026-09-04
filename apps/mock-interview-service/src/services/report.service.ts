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

export const generateMockInterviewReport = async (mockInterviewId: string) => {
  const questions = await MockInterviewQuestion.find({
    mockInterviewId,
  }).sort({
    questionNumber: 1,
  });

  if (!questions.length) {
    throw new Error("No interview questions found");
  }

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

The interview may have ended before all planned questions were answered.

If a question has no candidate answer, treat it as unanswered because the
candidate ended the interview early. Do NOT interpret this as evidence that
the candidate gave an incorrect technical answer.

Skipped questions are explicitly marked as skipped and have a score of 0.
Include skipped questions in the overall performance calculation.

Evaluate the candidate fairly based on the answers that were actually given.

Return ONLY valid JSON:

{
  "overallScore": 0,
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

  return report;
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
