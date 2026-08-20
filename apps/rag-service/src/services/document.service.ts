import fs from "fs";
import { extractText } from "unpdf";
import Document from "../models/Document.model.js";
import { uploadDocument } from "../clients/file-service.client.js";
import { createChunks } from "./chunk.service.js";

// Uploads a PDF, extracts its text and stores document metadata -> then creates searchable chunks with embeddings

export const uploadDocumentService = async (
  file: Express.Multer.File,
  uploadedBy: string,
) => {

  const uploadedFile = await uploadDocument(
    file, 
    uploadedBy
  ); // upload original PDF to File Service

  // read uploaded PDF into memory

  const buffer = fs.readFileSync(file.path);

  // convert node Buffer -> Uint8Array (required by unpdf)

  const pdfData = new Uint8Array(buffer);

  // extract text from the PDF

  const { text } = await extractText(pdfData);

  const extractedText = Array.isArray(text)
    ? text.join("\n")
    : text;

  // Save document metadata.

  const document = await Document.create({
    fileId: uploadedFile._id,
    fileName: uploadedFile.fileName,
    fileType: uploadedFile.mimeType,
    uploadedBy,
    extractedText,
    status: "READY",
  });

  // Split text into chunks, generate embeddings, and store everything in MongoDB.

  await createChunks(
    document._id.toString(),
    extractedText,
  );

  // Remove temporary file.
  
  fs.unlinkSync(file.path);

  return document;
};
