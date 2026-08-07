import openai from "../providers/openai.provider.js"

// generates an embedding vector for a piece of text 

export const generateEmbedding = async (
    text: string 
): Promise<number[]> => {
    
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small", // small embedding model optimized for search/RAG
        input: text 
    })
    return response.data[0].embedding 
}

// takes a chunk of text, sends it to OpenAI's Embedding API, and returns a numerical vector representing the meaning of that text 