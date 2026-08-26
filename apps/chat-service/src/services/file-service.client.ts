import axios from "axios";
import FormData from "form-data";

// uploads an attachment to File Service 

export const uploadAttachment = async (
    file: Express.Multer.File,
    uploadedBy: string 
) => {
    const formData = new FormData();

    formData.append(
        "file",
        file.buffer,
        {
            filename: file.originalname,
            contentType: file.mimetype,
        }
    );

    formData.append("uploadedBy", uploadedBy);

    const response = await axios.post(
        `${process.env.FILE_SERVICE_URL}/upload`,
        formData,
        {
            headers: {
                ...formData.getHeaders(), 
                "x-user-id": uploadedBy, 
                "x-user-role": userRole
            }
        }
    );

    return response.data.data; 
}