import Conversation, { ConversationDocument, ConversationType } from "../models/Conversation.model.js"
import { hasMentorshipAccess } from "./mentorship-access.service.js";
import Message from "../models/message.model.js"

// creating a new conversation or returning the existing one 

export const createConversationService = async (
    userId: string, 
    participantId: string, 
    type: ConversationType = ConversationType.DIRECT 
) => {

    // mentor chat requires an active mentorship subscription. The candidate creates the mentorship conversation after payment

    if(type === ConversationType.MENTORSHIP) {
        const hasAccess = await hasMentorshipAccess(
            userId, 
            participantId
        ) ; 

        if(!hasAccess) {
            throw new Error("An active mentorship subscription is required to start this chat.")
        }
    }

    // normalizing participant order to prevent duplicate conversations 

    const normalizedParticipants = [userId, participantId].sort() ; 

    const existingConversation = await Conversation.findOne({
        participants: {
            $all: normalizedParticipants, 
            $size: 2
        }, 
        isGroup: false,
        type
    })

    if(existingConversation) {
        return existingConversation ; 
    }

    return Conversation.create({
        participants: normalizedParticipants, 
        isGroup: false,
        type 
    })
}

// returns all conversations for a user 

export const getUserConversationsService = async (
  userId: string,
) => {
  const conversations = await Conversation.find({
    participants: userId,
  })
    .sort({
      updatedAt: -1,
    })
    .lean();

  return Promise.all(
    conversations.map(async (conversation) => {
      const unreadCount = await Message.countDocuments({
        conversationId: conversation._id,
        senderId: { $ne: userId },
        readBy: { $ne: userId },
      });

      return {
        ...conversation,
        unreadCount,
      };
    }),
  );
};