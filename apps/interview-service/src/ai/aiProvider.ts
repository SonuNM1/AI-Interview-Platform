/*Acts as the single entry point for all AI operations. 

The Interview Service should never know which AI provider is being used. Today we may use OpenAI, but tomorrow we might switch to Gemini, Claude, or another provider. By routing every AI request through this provider, the interview flow remains unchanged even if the underlying LLM changes. 

Provider selection can later be controlled through environment variables, allowing different AI providers without modifying business logic. 
*/

import { evaluateAnswer, generateInterviewReport, generateQuestion } from "./openai.service.js";

export const aiProvider = {
  generateQuestion,
  evaluateAnswer, 
  generateInterviewReport
};