import { Request, Response } from "express";
import {
  createConversationService,
  getUserConversationsService,
} from "../services/conversation.service.js";
import { getConversationMessagesService } from "../services/message.service.js";

// creates a conversation

export const createConversation = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { participantId } = req.body;

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

    const conversation = await createConversationService(userId, participantId);

    return res.status(201).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error("Create conversation error: ", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create conversation.",
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
