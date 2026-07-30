import {S3Client} from "@aws-sdk/client-s3" ; 

// AWS S3 Client used for uploading, downloading and deleting files 

const s3Client = new S3Client({
    region: process.env.AWS_REGION!, // AWS Region where our bucket is hosted. Requests are routed to this geographical location

    // IAM credentials used to authenticate this service with AWS. 

    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
})

export default s3Client ; 