import mongoose, { Schema, Document } from "mongoose";

// represents one searchable piece (chunk) of a document

export interface ChunkDocument extends Document {
  documentId: mongoose.Types.ObjectId;
  chunkIndex: number;
  text: string;

  // numerical representation of this chunk used for semantic search

  embedding: number[]
}

const chunkSchema = new Schema<ChunkDocument>(
  {
    // Parent document this chunk belongs to

    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },

    // Position of this chunk inside the document

    chunkIndex: {
      type: Number,
      required: true,
    },

    // Actual chunk text

    text: {
      type: String,
      required: true,
    },

    // Vector representation of this chunk used for semantic search

    embedding: {
      type: [Number],
      required: true,   // every chunk must have an embedding. If a chunk doesn't, it can't participate in vector search 
    },
  },
  {
    timestamps: true,
  },
);

// Fast lookup of all chunks for a document

chunkSchema.index({
  documentId: 1,
  chunkIndex: 1,
});

export default mongoose.model<ChunkDocument>("Chunk", chunkSchema);
