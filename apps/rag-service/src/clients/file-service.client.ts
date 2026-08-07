import axios from "axios";
import FormData from "form-data";
import fs from "fs";

// Uploads a document to the File Service.

export const uploadDocument = async (
  file: Express.Multer.File,
  uploadedBy: string,
) => {
  const formData = new FormData();

  formData.append("file", fs.createReadStream(file.path), file.originalname);

  formData.append("uploadedBy", uploadedBy);

  console.log("FILE_SERVICE_URL:", process.env.FILE_SERVICE_URL);

  console.log(`${process.env.FILE_SERVICE_URL}/api/v1/files/upload`);

  const response = await axios.post(
    `${process.env.FILE_SERVICE_URL}/api/v1/files/upload`,
    formData,
    {
      headers: formData.getHeaders(),
    },
  );

  return response.data.data;
};
