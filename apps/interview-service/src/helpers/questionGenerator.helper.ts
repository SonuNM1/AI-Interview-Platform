import { IInterview } from "../models/interview.model.js";
import { IInterviewQuestion } from "../models/interviewQuestion.model.js";
import { aiProvider } from "../ai/aiProvider.js";
import { buildNextQuestionPrompt } from "../ai/prompts.js";

interface GenerateNextQuestionParams {
  interview: IInterview;
  previousQuestion: IInterviewQuestion;
  previousAnswer: string;
}

/**
 * Generates the next interview question for the candidate.
 *
 * Currently this helper returns predefined questions to simulate an AI interview.
 * In future, this is the only place that will integrate with Gemini/OpenAI to
 * generate context-aware follow-up questions based on the candidate's response.
 */
export const generateNextQuestion = async ({
  interview,
  previousQuestion,
  previousAnswer,
}: GenerateNextQuestionParams): Promise<string> => {

  const prompt = buildNextQuestionPrompt({
    interview, 
    previousAnswer, 
    previousQuestion
  })

  return await aiProvider.generateQuestion(prompt) ;
};