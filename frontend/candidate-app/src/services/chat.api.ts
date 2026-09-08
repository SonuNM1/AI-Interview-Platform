import api from "./api";

export type ConversationType = | "DIRECT" | "MENTORSHIP" ; 

export interface Conversation {
    _id: string;
  participants: string[];
  isGroup: boolean;
  type: ConversationType;
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

// returns all conversations belonging to the authenticated candidate 

export const getConversations = async (): Promise<Conversation[]> => {
    const response = await api.get("/chat/conversations") ; 

    return response.data.data ; 
}

// creates or returns the existing mentorship conversation 

export const createMentorshipConversation = async (
    mentorId: string 
): Promise<Conversation> => {
    const response = await api.post(
        "/chat/conversations",
        {
            participantId: mentorId, 
            type: "MENTORSHIP"
        }
    )
    return response.data.data ; 
}

// returns conversation history 

export const getConversationMessages = async (
    conversationId: string 
): Promise<ChatMessage[]> => {
    const response = await api.get(
        `/chat/conversations/${conversationId}/messages`
    ) ; 

    return response.data.data 
}