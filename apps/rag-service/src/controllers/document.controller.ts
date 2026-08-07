import { Request, Response } from "express";

import { uploadDocumentService } from "../services/document.service.js";

// Uploads a document and extracts its text.

export const uploadDocument = async (
  req: Request,
  res: Response,
) => {
  try {
    const file = req.file;
    const { uploadedBy } = req.body;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Document is required.",
      });
    }

    const document = await uploadDocumentService(
      file,
      uploadedBy,
    );

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