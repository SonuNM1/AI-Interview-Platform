import { IInterview, InterviewDifficulty } from "../models/interview.model.js";
import { IInterviewQuestion, QuestionType } from "../models/interviewQuestion.model.js";
import { aiProvider } from "../ai/aiProvider.js";
import {buildEvaluationPrompt, buildQuestionPrompt} from "../ai/prompts.js";
import { EvaluationResult } from "../ai/openai.service.js";

interface GenerateQuestionParams  {
  interview: IInterview;
  previousQuestion?: IInterviewQuestion;
  previousAnswer?: string;
}

export interface GeneratedQuestion {
  question: string;
  type: QuestionType;
  difficulty: InterviewDifficulty;
}

/*
Generates interview questions using the configured AI provider. Keeps interview business logic independent from prompt generation and the underlying AI provider. 
*/

export const generateQuestion = async ({
  interview,
  previousQuestion,
  previousAnswer,
}: GenerateQuestionParams ): Promise<GeneratedQuestion> => {

  const prompt = buildQuestionPrompt({
    interview, 
    previousAnswer, 
    previousQuestion
  })

  return await aiProvider.generateQuestion(prompt);
};

/*
Evaluate the candidate's answer using the configured AI provider. 

Builds an evaluation prompt and delegates teh assessment to the configured AI provider while keeping interview business logic independent from the underlying LLM. 
*/

export const evaluateCandidateAnswer = async ({
  question,
  candidateAnswer,
}: {
  question: string;
  candidateAnswer: string;
}): Promise<EvaluationResult> => {

  const prompt = buildEvaluationPrompt({
    question,
    candidateAnswer,
  });

  return await aiProvider.evaluateAnswer(prompt);

};