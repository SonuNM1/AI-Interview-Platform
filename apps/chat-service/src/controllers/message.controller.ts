import { Request, Response } from "express";
import {
  createMessageService,
  deleteMessageService,
  editMessageService,
  getConversationMessagesService,
  sendMessageService,
} from "../services/message.service.js";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// creates a new message

export const createMessage = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { conversationId, text, attachments } = req.body;

    const senderId = req.headers["x-user-id"] as string;

    if (!senderId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID missing",
      });
    }

    const message = await createMessageService(
      conversationId,
      senderId,
      text,
      attachments,
    );
    return res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Create Message Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create message.",
    });
  }
};

// returns messages of a conversation

export const getConversationMessages = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const conversationId = req.params.conversationId as string;

    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID missing",
      });
    }

    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 20;

    const messages = await getConversationMessagesService(
      conversationId,
      page,
      limit,
      userId,
    );

    return res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Get Messages Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages.",
    });
  }
};

// updating an existing message

export const editMessage = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const messageId = req.params.messageId as string;

    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID missing",
      });
    }

    const { text } = req.body;

    // Update message

    const message = await editMessageService(messageId, text, userId);

    return res.status(200).json({
      success: true,
      message: "Message updated successfully.",
      data: message,
    });
  } catch (error) {
    console.error("Edit message error:", error);

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update message.",
    });
  }
};

// soft deletes a message

export const deleteMessage = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const messageId = req.params.messageId as string;

    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID missing",
      });
    }

    // Delete message

    const message = await deleteMessageService(messageId, userId);

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully.",
      data: message,
    });
  } catch (error) {
    console.error("Delete message error:", error);

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete message.",
    });
  }
};

// sends a message with an optional attachment

export const sendMessage = async (
  req: MulterRequest,
  res: Response,
): Promise<Response> => {
  try {
    const { conversationId, text } = req.body;

    const senderId = req.headers["x-user-id"] as string;

    if (!senderId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID missing",
      });
    }

    const message = await sendMessageService(
      conversationId,
      senderId,
      text,
      req.file,
    );

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("Send message error: ", error);

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};
