import Chunk from "../models/chunk.model.js";
import { generateEmbedding } from "./embedding.service.js";

// Finds the most relevant chunks for a user's question 

export const searchDocuments = async (question: string) => {

    // Convert the user's question into an embedding vector 

    const questionEmbedding = await generateEmbedding(question) ; 

    console.log("✅ Question embeddinng generated") ; 

    // perform semantic search using MongoDB Atlas Vector Search 

    const results = await Chunk.aggregate([
        {
            $vectorSearch: {
                index: "chunk_vector_index", 
                path: "embedding", // embedding field inside MongoDB
                queryVector: questionEmbedding, // user question embedding 
                numCandidates: 100, // number of documents to scan
                limit: 5, // return top matching chunks
            }
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
                    $meta: "vectorSearchScore"
                }
            }
        }
    ])
    console.log(`✅ ${results.length} relevant chunks found`) ; 

    // print the returned chunks 

    console.log(JSON.stringify(results, null, 2)) ; 

    return results ; // return the results to the controller 
}