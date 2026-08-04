import { Request, Response } from "express";
import { generateMentorResponse } from "../services/mentor.service.js";

// chat with the AI mentor

export const chatWithMentor = async (req: Request, res: Response) => {
  try {
    const { conversationId, message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    const response = await generateMentorResponse(
      conversationId, 
      message
    );

    return res.json({
      success: true,
      data: {
        reply: response,
      },
    });
  } catch (error) {
    console.error("Mentor error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate AI response.",
    });
  }
};
