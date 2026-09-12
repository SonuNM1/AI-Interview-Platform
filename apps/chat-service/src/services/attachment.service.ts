import {
  getAttachmentSignedUrl,
  uploadAttachment,
} from "./file-service.client.js";
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

// Generates a temporary signed URL for a chat attachment.

export const getAttachmentSignedUrlService = async (
  fileId: string,
  userId: string,
) => {
  return await getAttachmentSignedUrl(fileId, userId);
};