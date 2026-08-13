import openai from "../providers/openai.provider.js";
import MockInterviewQuestion from "../models/mockInterviewQuestion.model.js";
import MockInterviewReport from "../models/mockInterviewReport.model.js";
import MockInterview, {
  MockInterviewStatus,
} from "../models/mockInterview.model.js";

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

export const getMockInterviewReport = async (mockInterviewId: string) => {
  const mockInterview = await MockInterview.findById(mockInterviewId);

  if (!mockInterview) {
    return {
      success: false,
      message: "Mock interview not found",
    };
  }

  // report can only be generated after completion

  if (mockInterview.status !== MockInterviewStatus.COMPLETED) {
    return {
      success: false,
      message: "Mock Interview is not completed yet",
    };
  }

  // return existing report if already generated

  const existingReport = await MockInterviewReport.findOne({
    mockInterviewId: mockInterview._id,
  });

  if (existingReport) {
    return {
      success: true,
      data: existingReport,
    };
  }

  // Generate report if it doesn't exist

  const report = await generateMockInterviewReport(
    mockInterview._id.toString(),
  );

  // Save generated report

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
    data: savedReport,
  };
};
