import { uploadAttachment } from "./file-service.client.js";

// uploads an attachment using File Service 

export const uploadAttachmentService = async (
    file: Express.Multer.File,
    uploadedBy: string
) => {

    const uploadedFile = await uploadAttachment(
        file,
        uploadedBy
    );

    return uploadedFile;

};