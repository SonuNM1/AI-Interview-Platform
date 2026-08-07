import Chunk from "../models/chunk.model.js";
import { chunkText } from "../utils/chunk-text.js";
import { generateEmbedding } from "./embedding.service.js";

// Splits extracted text into chunks, generates embeddings, and stores everything into MongoDB.

export const createChunks = async (
  documentId: string,
  extractedText: string,
) => {

  // Split the document into smaller chunks.

  const chunks = chunkText(extractedText);

  // Store all chunk records before inserting them.

  const records: {
    documentId: string;
    chunkIndex: number;
    text: string;
    embedding: number[];
  }[] = [];

  // Generate an embedding for every chunk.

  for (let index = 0; index < chunks.length; index++) {

    const text = chunks[index];

    // Convert this chunk into a semantic vector.

    const embedding = await generateEmbedding(text);

    console.log(
      `✅ Embedding generated (${index + 1}/${chunks.length})`,
    );

    // Prepare MongoDB record.

    records.push({
      documentId,
      chunkIndex: index,
      text,
      embedding,
    });
  }

  // Save all chunks together.
  
  await Chunk.insertMany(records);

  console.log(`✅ ${records.length} chunks saved with embeddings.`);

  return records;
};