import OpenAI from "openai";
import { AI_MODELS } from "../constants/ai.constants.js";
import { MENTOR_SYSTEM_PROMPT } from "../prompts/mentor.system.prompt.js";

let currentAbortController: AbortController | null = null;

// creating an OpenAi client

const getOpenAIClient = () => {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  });
};

// Sends conversation history to OpenAI and streams the response.

export const generateResponse = async (
  messages: {
    role: "system" | "user" | "assistant";
    content: string;
  }[],
  onToken?: (token: string) => void,
): Promise<string> => {
  // controller used to cancel the current generation

  const controller = new AbortController();

  currentAbortController = controller;

  const openai = getOpenAIClient();

  const stream = await openai.chat.completions.create(
    {
      model: AI_MODELS.DEFAULT,
      messages: [
        {
          role: "system",
          content: MENTOR_SYSTEM_PROMPT,
        },
        ...messages,
      ],
      stream: true,
    },
    {
      signal: controller.signal,
    },
  );

  let finalResponse = "";

  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content ?? "";

    if (!token) continue;
    finalResponse += token;
    onToken?.(token);
  }

  currentAbortController = null;
  return finalResponse;
};

// stops the current AI generation if one is running

export const stopGeneration = () => {
  currentAbortController?.abort();
  currentAbortController = null;
};
