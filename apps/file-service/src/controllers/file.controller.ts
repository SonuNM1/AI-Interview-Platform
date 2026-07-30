import {Request, Response, NextFunction} from "express" ; 
import { uploadFile } from "../services/file.service.js";

interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

// receives an uploaded file, delegates the upload process to the service and returns the uploaded file details 

export const uploadFileController = async (
    req: MulterRequest, 
    res: Response, 
    next: NextFunction 
) => {
    try {
        
        // Multer stores the uploaded file on req.file 

        if(!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded.",
            });
        }

        // uploading the file and save its metadata 

        const uploadedFile = await uploadFile(
            req.file,
            req.body.uploadedBy,
            req.body.isPublic
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
}