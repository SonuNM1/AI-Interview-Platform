import api from "./api";

export interface Conversation {
  _id: string;
  participants: string[];
  isGroup: boolean;
  type: "DIRECT" | "MENTORSHIP";
  title?: string;
  lastMessageId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  text: string;
  attachments: {
    fileId: string;
    url: string;
    fileName: string;
    mimeType: string;
  }[];
  readBy: string[];
  edited: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// Returns conversations belonging to the authenticated mentor

export const getConversations = async (): Promise<
  Conversation[]
> => {
  const response = await api.get(
    "/chat/conversations",
  );

  return response.data.data;
};

// Returns messages belonging to a conversation

export const getConversationMessages = async (
  conversationId: string,
): Promise<ChatMessage[]> => {
  const response = await api.get(
    `/chat/conversations/${conversationId}/messages`,
  );

  return response.data.data;
};