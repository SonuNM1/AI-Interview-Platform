import axios from "axios";

// fetches conversation history from the Chat Service

export const getConversationHistory = async (conversationId: string) => {
    const response = await axios.get(
        `${process.env.CHAT_SERVICE_URL}/api/v1/conversations/${conversationId}/messages`
    ) ; 

    return response.data.data ; 
}

// saves an AI response as a chat message 

export const saveAIMessage = async (
    conversationId: string, 
    text: String 
) => {
    await axios.post(`${process.env.CHAT_SERVICE_URL}/api/v1/messages`, {
        conversationId,
            senderId: "AI_MENTOR",
            text,
            attachments: [],
    })
}

// Save a user's message to the Chat Service 

export const saveUserMessage = async (
    conversationId: string, 
    senderId: string, 
    text: string 
) => {
    await axios.post(
        `${process.env.CHAT_SERVICE_URL}/api/v1/messages`,
        {
            conversationId,
            senderId,
            text,
            attachments: []
        }
    );
}