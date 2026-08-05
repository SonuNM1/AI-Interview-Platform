import { generateResponse } from "../providers/openai.provider.js";
import {
  getConversationHistory,
  saveAIMessage,
  saveUserMessage,
} from "./chat-service.client.js";

// generats an AI mentor response using previous conversation history

export const generateMentorResponse = async (
  conversationId: string,
  message: string,
  onToken: (token: string) => void 
) => {
  // Save current user's message

  await saveUserMessage(conversationId, "USER", message);

  // fetch latest conversation history

  const history = await getConversationHistory(conversationId);

  const messages = history.map((msg: any) => ({
    role: msg.senderId === "AI_MENTOR" ? "assistant" : "user",
    content: msg.text,
  }));

  // Generate AI response while forwarding every token 

  const reply = await generateResponse(
    messages, 
    onToken,
  )

  // Save AI reply
  
  await saveAIMessage(conversationId, reply);

  return reply;
};
