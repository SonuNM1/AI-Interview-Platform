import {
    PutObjectCommand, 
    DeleteObjectCommand,
    GetObjectCommand
} from "@aws-sdk/client-s3"
import s3Client from "../config/aws.config.js"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Uploads a file to AWS S3

export const uploadFileToS3 = async (
    key: string, 
    file: Buffer, 
    mimeType: string 
) => {
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        
        Key: key, // Key is the complete path of the object inside the bucket 

        Body: file,
        ContentType: mimeType // MIME type tells browsers and clients what kind of file this is - image/png, image/jpeg, application/pdf 
    }) ; 

    const response = await s3Client.send(command) ; 

    return {
        key, 
        url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,

        // ETag is returned by S3 after a successful upload. It can be used to verify the uploaded object's integrity.

        etag: response.ETag?.replace(/"/g, "") || "",
    }
}

// Deletes a file from AWS S3

export const deleteFileFromS3 = async (key: string) => {
    const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!, 
        Key: key
    }) ;

    await s3Client.send(command) ;
}

// Generates a temporary signed URL for accessing a private file 

export const generateSignedUrl = async (key: string) => {

    const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: key,
    });

    return await getSignedUrl(s3Client, command, {
        expiresIn: 60 * 5, // 5 minutes
    });
};