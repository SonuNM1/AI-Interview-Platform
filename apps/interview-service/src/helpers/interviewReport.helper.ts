import { aiProvider } from "../ai/aiProvider.js";
import { buildInterviewReportPrompt } from "../ai/prompts.js";
import { InterviewReport } from "../ai/openai.service.js";

// Generating the final AI interview report. Building the report prompt and delegates report generation to the configured AI provider while keeping interview business logic independent from the underlying LLM.

export interface GenerateInterviewReportParams {
  role: string;
  experience: number;
  questions: {
    question: string;
    answer: string;
    score?: number;
    feedback?: string;
  }[];
}

export const generateInterviewReport = async ({
    role, 
    experience, 
    questions 
}: GenerateInterviewReportParams): Promise<InterviewReport> => {
    const prompt = buildInterviewReportPrompt({
    role,
    experience,
    questions,
  });

  return await aiProvider.generateInterviewReport(prompt);
}