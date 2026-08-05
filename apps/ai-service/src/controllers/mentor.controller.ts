import { Request, Response } from "express";
import { generateMentorResponse } from "../services/mentor.service.js";
import { stopGeneration } from "../providers/openai.provider.js";

// chat with the AI mentor

export const chatWithMentor = async (req: Request, res: Response) => {
  try {
    const { conversationId, message } = req.body;

    res.setHeader("Content-Type", "text/plain"); // tell the client we're sending plain text instead of JSON
    res.setHeader("Transfer-Encoding", "chunked"); // send the response in small chunks as we're generating instead of waiting

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    const response = await generateMentorResponse(conversationId, message);

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

// Streams the AI response token-by-token

export const streamMentorResponse = async (req: Request, res: Response) => {
  try {
    const { conversationId, message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // tell the client we are sending plain text

    res.setHeader("Content-Type", "text/plain");

    // Send response as chunks.

    res.setHeader("Transfer-Encoding", "chunked");

    await generateMentorResponse(conversationId, message, (token) => {
      res.write(token);
    });

    res.end();
  } catch (error) {
    console.error("Mentor stream error:", error);

    res.end();
  }
};

// stops the current AI response generation 

export const stopMentorResponse = (
  req: Request, 
  res: Response 
) => {
  stopGeneration() ; 

  return res.json({
    success: true, 
    message: "Generation stopped."
  })
}