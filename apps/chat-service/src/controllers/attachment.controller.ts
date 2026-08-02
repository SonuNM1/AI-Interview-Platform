import { Request, Response } from "express";
import { uploadAttachmentService } from "../services/attachment.service.js";

interface MulterRequest extends Request {
    file?: Express.Multer.File ; 
}

// uploads a chat attachment 

export const uploadAttachment = async (
    req: MulterRequest, 
    res: Response 
): Promise<Response> => {
    try {
        if (!req.file) {

            return res.status(400).json({
                success: false,
                message: "No attachment uploaded."
            });

        }

        // later this will come from socket/auth 

        const uploadedBy = req.body.uploadedBy;

        const uploadedFile =
            await uploadAttachmentService(
                req.file,
                uploadedBy
            );

            return res.status(201).json({

            success: true,

            message: "Attachment uploaded successfully.",

            data: uploadedFile

        });

    } catch (error) {
        console.error(
            "Attachment upload error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error instanceof Error
                    ? error.message: "Internal Server Error"

        });
    }
}