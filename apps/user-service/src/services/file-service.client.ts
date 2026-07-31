import axios from "axios";
import FormData from "form-data";

// uploading a file to File Service and returns the uploaded file details 

export const uploadFileToFileService = async (
    file: Express.Multer.File, 
    uploadedBy: string 
) => {

    // creating multipart/form-data request 

    const formData = new FormData() ; 

    formData.append("file", file.buffer, {
        filename: file.originalname, 
        contentType: file.mimetype 
    }) ; 

    formData.append("uploadedBy", uploadedBy) ; 

    formData.append("isPublic", "false") ; 

    // calling File Service 

    const response = await axios.post(
        `${process.env.FILE_SERVICE_URL}/upload`,
        formData, 
        {
            headers: formData.getHeaders()
        }
    ) ; 

    return response.data.data ; // returning uploaded file details 
}

// deleting a file from the File Service 

export const deleteFileFromFileService = async (
    fileId: string
) => {
    await axios.delete(
        `${process.env.FILE_SERVICE_URL}/${fileId}`
    );
};