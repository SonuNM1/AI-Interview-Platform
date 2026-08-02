import Conversation, { ConversationDocument } from "../models/Conversation.model.js"

// creating a new conversation or returning the existing one 

export const createConversationService = async (
    participants: string[], 
    isGroup: boolean = false, 
    title?: string 
) => {

    // normalizing participant order to prevent duplicate conversations 

    const normalizedParticipants = [...participants].sort();

    if(!isGroup) {

        const existingConversation = await Conversation.findOne({
            participants: {
                $all: normalizedParticipants,
                $size: normalizedParticipants.length
            },
            isGroup: false
        });

        if (existingConversation) {
            return existingConversation;
        }
    }
    return Conversation.create({
        participants: normalizedParticipants,
        isGroup,
        title
    });
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