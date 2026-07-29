/*Acts as the single entry point for all AI operations. The interview flow should never know which AI provider is being used. This abstraction makes it easy to switch between OpenAI, Gemini, Claude, or any future provider.
*/

import { generateQuestion } from "./openai.service.js";

export const aiProvider = {
  generateQuestion,
};