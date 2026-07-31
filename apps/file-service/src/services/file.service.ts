import path from "path";

// generates a globally unique filename (eg: 8d7ab6d3-9c5a-4c4d-aad3-3a6c0ef4d8f1.pdf rather than resume.pdf) - this prevents two users uploading files with the same name from overwriting each other 

import { randomUUID } from "crypto"; 
import File from "../models/file.model.js";
import { deleteFileFromS3, generateSignedUrl, uploadFileToS3 } from "../helpers/s3.helper.js";

// uploading a file to S3, storing its metadata in MongoDB, and returns the saved document 

export const uploadFile = async (
    file: Express.Multer.File, 
    uploadedBy: string, 
    isPublic: boolean = false 
) => {

    const extension = path.extname(file.originalname) ; // extracting the file extension from the original filename 

    const fileName = `${randomUUID()}${extension}` ; // generates a unique filename to avoid collisions in S3 

    const now = new Date() ; // organizes uploaded files by year and month 

    const year = now.getFullYear() ; // current year 

    const month = String(now.getMonth() + 1).padStart(2, "0") ; // current month 

    // S3 Object path 

    const key = `uploads/${year}/${month}/${fileName}` ; 

    // uploading the file to S3

    const uploadedFile = await uploadFileToS3(
        key, 
        file.buffer,
        file.mimetype 
    ) ; 

    // saving uploaded file metadata into MongoDB 

    const savedFile = await File.create({
        originalName: file.originalname, 
        fileName, 

        mimeType: file.mimetype, 

        extension, 
        size: file.size, 

        bucket: process.env.AWS_S3_BUCKET_NAME!, 

        key: uploadedFile.key,
        url: uploadedFile.url,
        etag: uploadedFile.etag,

        uploadedBy,
        isPublic,
    }) ;
    return savedFile ; 
}

// Deleting a file from S3 and MongoDB - later will add authorization as well to ensure only the owner/admin can delete 

export const deleteFile = async (fileId: string) => {

    const file = await File.findById(fileId);

    if (!file) {
        throw new Error("File not found.");
    }

    // Delete from S3
    await deleteFileFromS3(file.key);

    // Delete metadata from MongoDB
    await file.deleteOne();

    return;
}

// Get file by ID - returns file metadata by its ID - later in future authorization will ensure only permitted users can access the private files 

export const getFileById = async (fileId: string) => {

    const file = await File.findById(fileId);

    if (!file) {
        throw new Error("File not found.");
    }

    return file;
}

// returns a signed URL for a file - authorization will be added later on 

export const getSignedUrlByFileId = async (fileId: string) => {

    const file = await File.findById(fileId);

    if (!file) {
        throw new Error("File not found.");
    }

    const signedUrl = await generateSignedUrl(file.key);

    return {
        url: signedUrl,
    };
};