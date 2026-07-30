import "dotenv/config" ; 
import {PutObjectCommand} from "@aws-sdk/client-s3"
import s3Client from "../config/aws.config.js"

// to verify aws s3 connectivity by uploading a simple text file. Will remove this script once the upload API is implmented 

const testUpload = async () => {
    try {
        
        // PutObject uploads a new object (file) into the S3 bucket. If an object with the same key already exists, it will be overwritten 

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME!, // Target bucket where the object will be stored 

            // object key acts like the file path inside S3
            
            Key: "test/hello.txt", 

            // actual file content - we are uploading a simple text string instead of a real file 

            Body: "Hello from AI Interview Platform 🚀",

            // MIME type tells S3 and browsers what kind of file this is 

            ContentType: "text/plain"  
        })

        // sending the upload request to AWS 

        await s3Client.send(command) ; 

        console.log("✅ File uploaded successfully")
    } catch (error) {
        console.error("❌ Upload failed:", error);
    }
}

testUpload() ; 