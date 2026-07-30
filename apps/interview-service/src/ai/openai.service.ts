import "dotenv/config";
import OpenAI from "openai";
import { InterviewDifficulty } from "../models/interview.model.js";
import { QuestionType } from "../models/interviewQuestion.model.js";

/*Communicates with the OpenAI API. This service will generate interview questions, evaluate answers, and produce interview reports.
*/

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface GeneratedQuestion {
  question: string;
  type: QuestionType;
  difficulty: InterviewDifficulty;
}

export interface EvaluationResult {
  score: number; 
  feedback: string; 
  idealAnswer: string; 
}

export interface InterviewReport {
  communicationScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: "Hire" | "Hold" | "Reject";
  summary: string;
}

export const generateQuestion = async (
  prompt: string,
): Promise<GeneratedQuestion> => {

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL!,
    input: prompt,
  });

  // Removing markdown code fences if the model returns them

  const cleanedResponse = response.output_text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const generatedQuestion: GeneratedQuestion = JSON.parse(cleanedResponse);

  return generatedQuestion;
};

export const evaluateAnswer = async (
  prompt: string
): Promise<EvaluationResult> => {

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL!,
    input: prompt,
  });

  const cleanedResponse = response.output_text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleanedResponse);

};

export const generateInterviewReport = async (
  prompt: string,
): Promise<InterviewReport> => {

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL!,
    input: prompt,
  });

  const cleanedResponse = response.output_text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleanedResponse);

};