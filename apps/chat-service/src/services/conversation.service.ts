import Conversation, { ConversationDocument } from "../models/Conversation.model.js"

// creating a new conversation or returning the existing one 

export const createConversationService = async (
    userId: string, 
    participantId: string 
) => {

    // normalizing participant order to prevent duplicate conversations 

    const normalizedParticipants = [userId, participantId].sort() ; 

    const existingConversation = await Conversation.findOne({
        participants: {
            $all: normalizedParticipants, 
            $size: 2
        }, 
        isGroup: false 
    })

    if(existingConversation) {
        return existingConversation ; 
    }

    return Conversation.create({
        participants: normalizedParticipants, 
        isGroup: false 
    })
}

// returns all conversations for a user 

export const getUserConversationsService = async (
    userId: string
): Promise<ConversationDocument[]> => {

    return Conversation
        .find({
            participants: userId
        })
        .sort({
            updatedAt: -1
        });
};