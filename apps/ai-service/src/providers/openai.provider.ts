import OpenAI from "openai";
import { AI_MODELS } from "../constants/ai.constants.js";
import { MENTOR_SYSTEM_PROMPT } from "../prompts/mentor.system.prompt.js";

// creating an OpenAi client

const getOpenAIClient = () => {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  });
};

// sends a prompt to OpenAI and returns the response

export const generateResponse = async (
    messages: {
        role: "system" | "user" | "assistant";
        content: string;
    }[]
): Promise<string> => {

    const openai = getOpenAIClient();

    const completion =
        await openai.chat.completions.create({

            model: AI_MODELS.DEFAULT,

            messages: [
                {
                    role: "system",
                    content: MENTOR_SYSTEM_PROMPT,
                },
                ...messages,
            ],
        });
    return completion.choices[0].message.content ?? "";
};
