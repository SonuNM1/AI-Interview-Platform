import api from "./api";

export interface ChatUser {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  avatarFileId?: string | null;
}

export interface Conversation {
  _id: string;
  participants: string[];
  isGroup: boolean;
  type: "DIRECT" | "MENTORSHIP";
  title?: string;
  lastMessageId?: string;
  createdAt: string;
  updatedAt: string;
  unreadCount?: number;
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

// attachment metadata returned by the File Service after upload

export interface ChatAttachment {
  fileId: string;
  url: string;
  fileName: string;
  mimeType: string;
}

// Returns conversations belonging to the authenticated mentor

export const getConversations = async (): Promise<Conversation[]> => {
  const response = await api.get("/chat/conversations");

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

// uploads a chat attachment through the API Gateway and Chat Service

export const uploadChatAttachment = async (
  file: File,
): Promise<ChatAttachment> => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post("/chat/attachments/upload", formData);

  return response.data.data;
};

// Edits the text of an existing message

export const editChatMessage = async (
  messageId: string,
  text: string,
): Promise<ChatMessage> => {
  const response = await api.patch(
    `/chat/messages/${messageId}`,
    { text },
  );

  return response.data.data;
};

// Deletes an existing message

export const deleteChatMessage = async (
  messageId: string,
): Promise<ChatMessage> => {
  const response = await api.delete(
    `/chat/messages/${messageId}`,
  );

  return response.data.data;
};

// Gets a temporary signed URL for displaying/opening a chat attachment

export const getChatAttachmentSignedUrl = async (
  fileId: string,
): Promise<string> => {
  const response = await api.get(
    `/chat/attachments/signed-url/${fileId}`,
  );

  return response.data.data.url;
};