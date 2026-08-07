import mongoose, { Document, Schema } from "mongoose";

// Represents a document uploaded for Retrieval-Augmented Generation (RAG).

export interface DocumentModel extends Document {
  fileId: string;
  fileName: string;
  fileType: string;
  uploadedBy: string;
  extractedText: string;
  status: "PROCESSING" | "READY" | "FAILED";
}

const documentSchema = new Schema(
  {
    fileId: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    fileType: {
      type: String,
      required: true,
    },

    uploadedBy: {
      type: String,
      required: true,
      index: true,
    },

    extractedText: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["PROCESSING", "READY", "FAILED"],
      default: "PROCESSING",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<DocumentModel>(
  "Document",
  documentSchema,
);