import api from "./api";

export interface ChatUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  avatarFileId: string | null 
}

export interface Conversation {
  _id: string;
  participants: string[];
  type: "DIRECT" | "MENTORSHIP";
  isGroup: boolean;
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

// attachments metadata returned by the File Service after upload 

export interface ChatAttachment {
  fileId: string ; 
  url: string ; 
  fileName: string; 
  mimeType: string 
}

// uploads a chat attachments through the API Gateway and Chat Service 

export const uploadChatAttachment = async (
  file: File 
): Promise<ChatAttachment> => {

  const formData = new FormData() ; 

  formData.append("file", file) ; 

  const response = await api.post(
    "/chat/attachments/upload", 
    formData 
  ) ; 

  return response.data.data ; 

}

// edits the text  of an existing message 

export const editChatMessage = async (
  messageId: string, 
  text: string 
): Promise<ChatMessage> => {
  
  const response = await api.patch(
    `/chat/messages/${messageId}`, 
    {text} 
  )

  return response.data.data ; 
}

// deletes an existing message 

export const deleteChatMessage = async (
  messageId: string 
): Promise<ChatMessage> => {
  
  const response = await api.delete(
    `/chat/messages/${messageId}`
  ) ; 

  return response.data.data ; 

}

export const getCurrentUser = async (): Promise<ChatUser> => {
  const response = await api.get("/users/me");

  return response.data.data;
};

export const getConversations = async (): Promise<
  Conversation[]
> => {
  const response = await api.get("/chat/conversations");

  return response.data.data;
};

export const getUserById = async (
  userId: string,
): Promise<ChatUser> => {
  const response = await api.get(`/users/${userId}`);

  return response.data.data;
};

export const createMentorshipConversation = async (
  mentorId: string,
): Promise<Conversation> => {
  const response = await api.post(
    "/chat/conversations",
    {
      participantId: mentorId,
      type: "MENTORSHIP",
    },
  );

  return response.data.data;
};

export const getMessages = async (
  conversationId: string,
): Promise<ChatMessage[]> => {
  const response = await api.get(
    `/chat/conversations/${conversationId}/messages`,
  );

  return response.data.data;
};

export const waitForMentorshipConversation = async (
  mentorId: string,
): Promise<Conversation> => {
  let lastError: unknown;

  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      return await createMentorshipConversation(
        mentorId,
      );
    } catch (error) {
      lastError = error;

      await new Promise((resolve) =>
        setTimeout(resolve, 1000),
      );
    }
  }

  throw lastError ?? new Error(
    "Unable to open mentorship chat.",
  );
};

export const getChatAttachmentSignedUrl = async (
  fileId: string,
): Promise<string> => {
  const response = await api.get(
    `/chat/attachments/signed-url/${fileId}`,
  );

  return response.data.data.url;
};