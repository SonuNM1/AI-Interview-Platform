import { Request, Response } from "express";
import { searchDocuments } from "../services/rag.service.js";

// searches the uploaded documents using semantic search

export const searchDocumentsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    // retrieve the most relevant chunks

    const chunks = await searchDocuments(question);

    return res.json({
      success: true,
      data: chunks,
    });
  } catch (error) {
    console.error("Semantic Search Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search documents.",
    });
  }
};
