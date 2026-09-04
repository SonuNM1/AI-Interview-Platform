import { Request, Response } from "express";

import { getDocumentByFileId, uploadDocumentService } from "../services/document.service.js";

// Uploads a document and extracts its text.

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    
    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID missing",
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Document is required.",
      });
    }

    const document = await uploadDocumentService(file, userId);

    return res.status(201).json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error("Upload document error: ", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload document.",
    });
  }
};

// Returns the RAG document associated with the candidate's uploaded resume

export const getResumeDocument = async (req: Request, res: Response) => {
  try {
    const fileId = req.params.fileId as string;
    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID missing",
      });
    }

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: "File ID is required.",
      });
    }

    const document = await getDocumentByFileId(fileId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "RAG document not found.",
      });
    }

    // Ensure the document belongs to the authenticated candidate.

    if (document.uploadedBy !== userId) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this document.",
      });
    }

    return res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error("Get resume RAG document error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get resume document.",
    });
  }
};