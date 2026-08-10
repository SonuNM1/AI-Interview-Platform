import { Request, Response } from "express";
import {
  generateAnswer,
  searchDocuments,
  searchDocumentsStream,
} from "../services/rag.service.js";

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

    // generate the final answer using those chunks

    const answer = await generateAnswer(question, chunks);

    return res.json({
      success: true,
      data: {
        answer,
        chunks,
      },
    });
  } catch (error) {
    console.error("Semantic Search Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search documents.",
    });
  }
};

// Streams the RAG answer token-by-token to the client

export const searchDocumentsStreamController = async (
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

    // tell the client we'll stream text

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");

    // generate the RAG answer and write each token immediately

    const chunks = await searchDocumentsStream(question, (token) => {
      res.write(token);
    });

    res.end(); // tell Node that streaming is finished

    console.log(`✅ ${chunks.length} citations available`);
  } catch (error) {
    console.error("RAG Streaming error: ", error);

    res.end();
  }
};
