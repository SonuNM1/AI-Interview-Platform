import axios from "axios";

// fetches conversation history from the Chat Service

export const getConversationHistory = async (conversationId: string) => {
    const response = await axios.get(
        `${process.env.CHAT_SERVICE_URL}/api/v1/conversations/${conversationId}/messages`
    ) ; 

    return response.data.data ; 
}