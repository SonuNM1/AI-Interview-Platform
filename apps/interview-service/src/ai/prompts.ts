/*
Builds prompts sent to the AI model.

This file will contain prompts for question generation, interview evaluation, eport generation, resume analysis, and job description analysis.
*/

import { IInterview } from "../models/interview.model.js";
import { IInterviewQuestion } from "../models/interviewQuestion.model.js";

interface BuildNextQuestionPromptParams {
  interview: IInterview;
  previousQuestion: IInterviewQuestion;
  previousAnswer: string;
}

export const buildNextQuestionPrompt = ({
  interview,
  previousQuestion,
  previousAnswer,
}: BuildNextQuestionPromptParams): string => {
    return `
        You are an experienced technical interviewer. 

        Interview Details: 
        Role: ${interview.jobRole}
        Experience: ${interview.experience}
        Skills: ${interview.skills?.join(",")}

        Previous Question: ${previousQuestion.question}

        Candidate Answer: ${previousAnswer}

        Generate ONLY the next interview question. 

        Do not explain anything. 
        Do not number the question. 
        Return plain text only. 
    `
};