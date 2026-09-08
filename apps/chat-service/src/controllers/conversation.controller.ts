import { Request, Response } from "express";
import {
  createConversationService,
  getUserConversationsService,
} from "../services/conversation.service.js";
import { getConversationMessagesService } from "../services/message.service.js";
import { ConversationType } from "../models/Conversation.model.js";

// creates a conversation

export const createConversation = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { 
      participantId, 
      type = ConversationType.DIRECT 
     } = req.body;

    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID missing",
      });
    }

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: "Participant ID is required",
      });
    }

    if (participantId === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot start a conversation with yourself",
      });
    }

    // mentor chat is only available when the candidate has an active paid mentorship subscription - the payment service grants this access through RabbitMQ and Chat Service checks its local authorization projection. We need to know which participant is the candidate and which one is the mentor. x-user-role tells us the role of the authenticated requester 

    if (type !== ConversationType.DIRECT && type !== ConversationType.MENTORSHIP) {
      return res.status(400).json({
        success: false, 
        message: "Invalid conversation type."
      })
    }

    const conversation = await createConversationService(
      userId, 
      participantId, 
      type 
    );

    return res.status(201).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error("Create conversation error: ", error);

    const message = error instanceof Error ? error.message : "Failed to create conversation."

    // a candidate without an active mentorship subscription is authenticated but not authorized for mentorship chat 

    if(message.includes("active mentorship subscription")) {
      return res.status(403).json({
        success: false, 
        message 
      })
    }

    return res.status(500).json({
      success: false,
      message 
    });
  }
};

// return user's conversations

export const getUserConversations = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID missing",
      });
    }

    const conversations = await getUserConversationsService(userId);

    return res.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("Get user conversation error: ", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversations.",
    });
  }
};

// returns all messages of a conversation

export const getConversationMessages = async (req: Request, res: Response) => {
  try {
    const conversationId = req.params.conversationId as string ; 

    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID missing",
      });
    }

    console.log("Controller Conversation ID:", conversationId);

    const messages = await getConversationMessagesService(
      conversationId, 
      userId 
    );

    return res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Get conversation messages error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages.",
    });
  }
};
