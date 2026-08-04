import { generateResponse } from "../providers/openai.provider.js";
import { getConversationHistory } from "./chat-service.client.js";

// generats an AI mentor response using previous conversation history

export const generateMentorResponse = async (
  conversationId: string,
  message: string,
) => {
  const history = await getConversationHistory(conversationId); // Fetch previous messages

  console.log("Conversation History:");
  console.log(history);

  const messages: {
    role: "user" | "assistant";
    content: string;
  }[] = history.map((msg: any) => ({
    role: msg.senderId === "AI_MENTOR" ? "assistant" : "user",
    content: msg.text,
  }));

  // current user message

  messages.push({
    role: "user",
    content: message,
  });

  return generateResponse(messages);
};
