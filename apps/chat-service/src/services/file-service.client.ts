import axios from "axios";
import FormData from "form-data";

// Uploads a chat attachment to File Service

export const uploadAttachment = async (
  file: Express.Multer.File,
  uploadedBy: string,
) => {
  const formData = new FormData();

  formData.append("file", file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });

  formData.append("uploadedBy", uploadedBy);

  // Chat attachments need to be accessible to both participants

  formData.append("isPublic", "true");

  const response = await axios.post(
    `${process.env.FILE_SERVICE_URL}/upload`,
    formData,
    {
      headers: {
        ...formData.getHeaders(),
        "x-user-id": uploadedBy,
      },
    },
  );

  const uploadedFile = response.data.data;

  return {

    // MongoDB File Service ID
    
    fileId: uploadedFile._id.toString(),
    fileName: uploadedFile.originalName,

    mimeType: uploadedFile.mimeType,
    url: uploadedFile.url,
  };
};

// Gets a temporary signed S3 URL for a chat attachment

export const getAttachmentSignedUrl = async (
  fileId: string,
  userId: string,
) => {
  const response = await axios.get(
    `${process.env.FILE_SERVICE_URL}/signed-url/${fileId}`,
    {
      headers: {
        "x-user-id": userId,
      },
    },
  );

  return response.data.data.url;
};