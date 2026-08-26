import axios from "axios";
import FormData from "form-data";

// uploading a file to File Service and returns the uploaded file details

export const uploadFileToFileService = async (
  file: Express.Multer.File,
  uploadedBy: string,
  userRole: string,
) => {
  // creating multipart/form-data request

  const formData = new FormData();

  formData.append("file", file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });

  formData.append("isPublic", "false");

  // calling File Service

  const response = await axios.post(
    `${process.env.FILE_SERVICE_URL}/upload`,
    formData,
    {
      headers: {
        ...formData.getHeaders(),

        // File Service uses these headers for the authenticated user

        "x-user-id": uploadedBy,
        "x-user-role": userRole,
      },
    },
  );

  return response.data.data; // returning uploaded file details
};

// deleting a file from the File Service

export const deleteFileFromFileService = async (
    fileId: string, 
    userId: string , 
    userRole: string
) => {
  await axios.delete(`${process.env.FILE_SERVICE_URL}/${fileId}`, 
    {
        headers: {
            "x-user-id": userId, 
            "x-user-role": userRole
        }
    }
  );
};
