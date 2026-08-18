import { Request, Response, NextFunction } from "express";
import {
  deleteFile,
  getFileById,
  getSignedUrlByFileId,
  uploadFile,
} from "../services/file.service.js";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// receives an uploaded file, delegates the upload process to the service and returns the uploaded file details

export const uploadFileController = async (
  req: MulterRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Multer stores the uploaded file on req.file

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });
    }

    const uploadedBy = req.headers["x-user-id"] as string;

    if (!uploadedBy) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID missing",
      });
    }

    // uploading the file and save its metadata

    const uploadedFile = await uploadFile(
      req.file,
      uploadedBy,
      req.body.isPublic === "true",
    );

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully.",
      data: uploadedFile,
    });
  } catch (error) {
    console.error("File upload failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload file.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// deleting the file from S3 and MongoDB URL - later only file owner/admin will be allowed

export const deleteFileController = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const userRole = req.headers["x-user-role"] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user Id missing",
      });
    }

    await deleteFile(req.params.id, userId, userRole);

    return res.status(200).json({
      success: true,
      message: "File deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete file.",
    });
  }
};

// returns metadata of a single file - future implementation will add authorization after API Gateway

export const getFileByIdController = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const userRole = req.headers["x-user-role"] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID missing",
      });
    }

    const file = await getFileById(req.params.id, userId, userRole);

    return res.status(200).json({
      success: true,
      data: file,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch file.",
    });
  }
};

// Returns a temporary signed URL for a file

export const getSignedUrlController = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const userRole = req.headers["x-user-role"] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID missing",
      });
    }

    const url = await getSignedUrlByFileId(req.params.id, userId, userRole);

    return res.status(200).json({
      success: true,
      data: url,
    });
  } catch (error) {
    console.error("Signed URL error: ", error);

    return res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to generate signed URL.",
    });
  }
};
