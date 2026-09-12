import { Request, Response } from "express";
import {
  getAttachmentSignedUrlService,
  uploadAttachmentService,
} from "../services/attachment.service.js";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// uploads a chat attachment

export const uploadAttachment = async (
  req: MulterRequest,
  res: Response,
): Promise<Response> => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No attachment uploaded.",
      });
    }

    // later this will come from socket/auth

    const uploadedBy = req.headers["x-user-id"] as string;

    if (!uploadedBy) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID missing",
      });
    }

    const uploadedFile = await uploadAttachmentService(req.file, uploadedBy);

    return res.status(201).json({
      success: true,
      message: "Attachment uploaded successfully.",
      data: uploadedFile,
    });
  } catch (error) {
    console.error("Attachment upload error:", error);

    return res.status(500).json({
      success: false,

      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

// Generates a temporary signed URL for a chat attachment.

export const getAttachmentSignedUrl = async (
  req: Request<{ fileId: string }>,
  res: Response,
): Promise<Response> => {
  try {
    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID missing.",
      });
    }

    const signedUrl = await getAttachmentSignedUrlService(
      req.params.fileId,
      userId,
    );

    return res.status(200).json({
      success: true,
      data: {
        url: signedUrl,
      },
    });
  } catch (error) {
    console.error("Chat attachment signed URL error:", error);

    return res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to generate attachment URL.",
    });
  }
};