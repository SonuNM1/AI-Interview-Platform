import Chunk from "../models/chunk.model.js";
import { generateEmbedding } from "./embedding.service.js";
import openai from "../providers/openai.provider.js";

// Finds the most relevant chunks for a user's question

export const searchDocuments = async (question: string) => {
  // Convert the user's question into an embedding vector

  const questionEmbedding = await generateEmbedding(question);

  console.log("✅ Question embeddinng generated");

  // perform semantic search using MongoDB Atlas Vector Search

  const results = await Chunk.aggregate([
    {
      $vectorSearch: {
        index: "chunk_vector_index",
        path: "embedding", // embedding field inside MongoDB
        queryVector: questionEmbedding, // user question embedding
        numCandidates: 100, // number of documents to scan
        limit: 5, // return top matching chunks
      },
    },

    // return only required fields

    {
      $project: {
        _id: 0,
        documentId: 1,
        chunkIndex: 1,
        text: 1,

        // similarity score

        score: {
          $meta: "vectorSearchScore",
        },
      },
    },
  ]);
  console.log(`✅ ${results.length} relevant chunks found`);

  // print the returned chunks

  console.log(JSON.stringify(results, null, 2));

  return results; // return the results to the controller
};

// Generates the final AI answer using the retrieved chunks

export const generateAnswer = async (
  question: string,
  chunks: {
    text: string;
  }[],
) => {
  // Merge all retrieved chunks into one context.

  const context = chunks
    .map((chunk) => chunk.text)
    .join("\n\n----------------------\n\n");

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL!,

    messages: [
      {
        role: "system",
        content: `
You are an AI assistant.

Answer ONLY using the provided context.

If the answer cannot be found in the context, reply:

"I couldn't find that information in the uploaded documents."

Do not make up facts.
`,
      },
      {
        role: "user",
        content: `
Context:

${context}

----------------------

Question:

${question}
`,
      },
    ],
  });

  console.log("✅ Final answer generated");

  return completion.choices[0].message.content;
};

// searches relevant chunks and streams the final AI answer token-by-token

// Citations tell the user where the AI got its answer from = for example, which PDF/document and which chunk supported the answer

export const searchDocumentsStream = async (
  question: string,
  onToken: (token: string) => void,
) => {
  // 1. Convert the question into an embedding

  const questionEmbedding = await generateEmbedding(question);

  console.log("✅ Question embedding generated");

  // find the most relevant chunks from MongoDB Vector Search

  const chunks = await Chunk.aggregate([
    {
      $vectorSearch: {
        index: "chunk_vector_index",
        path: "embedding",
        queryVector: questionEmbedding,
        numCandidates: 100,
        limit: 5,
      },
    },

    // connecting Chunk with its parent document

    {
      $lookup: {
        from: "documents",
        localField: "documentId",
        foreignField: "_id",
        as: "document",
      },
    },

    // converting the document array into one object 

    {
      $unwind: "$document",
    }, 

    // returning only the fields needed by the application 

    {
      $project: {
        _id: 0,
        documentId: 1,
        chunkIndex: 1,
        text: 1,

        // filename from the document collection 

        fileName: "$document.fileName", 

        // vector similarity score 

        score: {
          $meta: "vectorSearchScore", 
        },
      },
    },
  ]);

  console.log(`✅ ${chunks.length} relevant chunks found`);

  // 3. Combine retrieved chunks into the context for GPT

  const context = chunks
    .map((chunk) => chunk.text)
    .join("\n\n--------------------\n\n");

  // 4. Ask GPT to generate the answer as a stream

  const stream = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL!,
    stream: true,

    messages: [
      {
        role: "system",
        content: `
          You are an AI assitant. 

          Answer ONLY using the provided context. 

          If the answer is not present in the context, say: "I couldn't find that information in the uploaded documents."

          Do not make up facts. 
        `,
      },
      {
        role: "user",
        content: `
          Context: ${context}

          -------------------

          Question: ${question}
        `,
      },
    ],
  });

  console.log("✅ RAG answer streaming started");

  // 5. send every generated token to the controller immediately

  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content;

    if (token) {
      onToken(token);
    }
  }

  console.log("✅ RAG answer streaming finished");

  return chunks; // return the chunks used to generate the answer.
};
