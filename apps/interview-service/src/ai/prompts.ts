/*Builds prompts for interview question generation. Keeps prompt engineering separate from interview business logic.The same helper generates both the first interview question and follow-up questions
 */

import { IInterview } from "../models/interview.model.js";
import { IInterviewQuestion } from "../models/interviewQuestion.model.js";

interface BuildQuestionPromptParams {
  interview: IInterview;
  previousQuestion?: IInterviewQuestion;
  previousAnswer?: string;
}

interface BuildEvaluationPromptParams {
  question: string; 
  candidateAnswer: string; 
}

interface BuildInterviewReportPromptParams {
  role: string; 
  experience: number; 
  questions: {
    question: string; 
    answer: string; 
    score?: number; 
    feedback?: string; 
  }[] ; 
}

export const buildQuestionPrompt = ({
  interview,
  previousQuestion,
  previousAnswer,
}: BuildQuestionPromptParams): string => {

  // First Question

  if (!previousQuestion) {

    return `
You are an experienced technical interviewer.

Role:
${interview.role}
Experience:
${interview.experience ?? "Not specified"} years
Skills:
${interview.skills.join(", ")}

Generate the FIRST interview question.

Return ONLY valid JSON.

Do not wrap the JSON inside markdown. Do not add explanations.Do not use \`\`\`json.

The response must exactly follow this schema: 

{
  "question": "string",
  "type": "HR | TECHNICAL | CODING | SYSTEM_DESIGN",
  "difficulty": "EASY | MEDIUM | HARD"
}
`;

  }

  // Follow-up Question

  return `
You are an experienced technical interviewer.

Role:
${interview.role}
Experience:
${interview.experience ?? "Not specified"} years
Skills:
${interview.skills.join(", ")}

Previous Question:
${previousQuestion.question}

Candidate Answer:
${previousAnswer}

Generate the NEXT interview question.

Rules:
- Ask only ONE follow-up question.
- Increase the difficulty gradually.
- Do not repeat previous topics.
- Do not use markdown
- Do not use \`\`\` json

Return ONLY valid JSON. The response much exactly match this schema:

{
  "question": "string",
  "type": "TECHNICAL | CODING | HR | SYSTEM_DESIGN",
  "difficulty": "EASY | MEDIUM | HARD"
}
`;

};

export const buildEvaluationPrompt = ({
  question,
  candidateAnswer,
}: BuildEvaluationPromptParams): string => {
  return `
You are a senior technical interviewer.

Question:
${question}

Candidate Answer:
${candidateAnswer}

Evaluate the answer like an experienced technical interview.

Guidelines: 

- Reward conceptual understanding even if terminology is not perfect. 
- Give partial credit when the candidate demonstrates correct intuition. 
- Do not expect textbook definitions. 
- Ignore minor grammatical mistakes or speaking hesitations. 
- Focus on technical correctness, reasoning, and practical experience. 
- Penalize only when the answer is technically incorrect, irrelevant, or extremely incomplete. 
- Candidates may answer in a conversational manner. Do not reduce scores simply because the answer is informal. 

Score Rules

0-2 = Very Poor 
3-4 = Poor 
5-6 = Average 
7-8 = Good 
9-10 = Excellent 

The score must be an integer between 0 and 10

Return ONLY valid JSON.

Do not use markdown.
Do not add explanations.

The response must exactly match this schema:

{
  "score": 0,
  "feedback": "string",
  "idealAnswer": "string"
}
`;
};

interface BuildInterviewReportPromptParams {
  role: string;
  experience: number;
  questions: {
    question: string;
    answer: string;
    score?: number;
    feedback?: string;
  }[];
}

export const buildInterviewReportPrompt = ({
  role,
  experience,
  questions,
}: BuildInterviewReportPromptParams): string => {

  return `
You are an expert technical interviewer.

Role:
${role}

Experience:
${experience} years

Interview Results:

${questions
  .map(
    (q, index) => `
Question ${index + 1}
Question: ${q.question}
Answer: ${q.answer}
Score: ${q.score}
Feedback: ${q.feedback}
`,
  )
  .join("\n")}

Generate the final interview report. Evaluation Guidelines

- Consider the overall interview performance instead of listing every missing detail.
- Reward practical understanding even if every implementation detail is not mentioned.
- Do not treat omitted advanced concepts as weaknesses unless they indicate a genuine knowledge gap.
- Keep strengths between 2 and 4 concise bullet points.
- Keep weaknesses between 1 and 3 concise bullet points.
- Weaknesses should highlight major improvement areas, not every omitted point.
- The recommendation should align with the overall score.
- The summary should be 2–4 sentences and focus on the candidate's overall performance.

Return ONLY valid JSON.

{
  "communicationScore": 0,
  "strengths": [],
  "weaknesses": [],
  "recommendation": "Hire | Hold | Reject",
  "summary": ""
}
`;
};