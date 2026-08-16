import { Request, Response } from "express";
import {
  generateAnswer,
  searchDocuments,
  searchDocumentsStream,
} from "../services/rag.service.js";

// searches the uploaded documents using semantic search - if documentId is provided, search is restricted to that document

export const searchDocumentsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { question, documentId } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    // retrieve the most relevant chunks - documentId is optional, so existing RAG requests still work

    const chunks = await searchDocuments(question, documentId);

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

// Streams the RAG answer and sends the sources used at the end.

export const searchDocumentsStreamController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { question, documentId } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    // Telling the browser that this is an SSE connection

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Generate and stream the answer - documentId is optional for backward compatibility

    const chunks = await searchDocumentsStream(
      question,
      (token) => {
        res.write(`event: answer\ndata: ${JSON.stringify(token)}\n\n`);
      },
      documentId,
    );

    // Send citation information after the AI finishes generating

    for (const chunk of chunks) {
      res.write(
        `event: citation\ndata: ${JSON.stringify({
          documentId: chunk.documentId,
          fileName: chunk.fileName,
          chunkIndex: chunk.chunkIndex,
          score: chunk.score,
        })}\n\n`,
      );
    }

    // tell the frontend that everything is finished

    res.write(
      `event: done\ndata: ${JSON.stringify({
        success: true,
      })}\n\n`,
    );

    res.end();

    console.log("✅ SSE stream completed.");
  } catch (error) {
    console.error("RAG Streaming Error:", error);

    // Send an SSE error event if possible.

    res.write(
      `event: error\ndata: ${JSON.stringify({
        message: "Failed to generate RAG response",
      })}\n\n`,
    );

    res.end();
  }
};
