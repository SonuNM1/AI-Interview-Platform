
## Foundations of AI Retrieval 

- Why LLMs hallucinate
- Context Window limitations 
- Why fine tuning isn't always the answer 
- What RAG solves 
- When to use RAG vs fine-tuning 
- When not to use RAG 
- History of RAG 

### Embeddings 

- What embeddings actually are 
- Why similar meanings end up close together 
- How embedding models are t rained 
- Dimensionality 
- Cosine similarity 
- Euclidean distance 
- Dot Product 
- Why embeddings don't store "knowledge" but capture semantic relationships 

## Chunking 

- Why we don't embed an entire PDF 
- Fixed-size chunking
- Recursive chunking 
- Semantic chunking 
- Sliding window chunking 
- Parent child chunking 
- Overlap 

## Vector databases 

- What a vector database is 
- Why MongoDB isnt' enough by itself 
- Indexes
- Approximate Nearest Neighbor (ANN)
- HNSW 
- IVF 
- Product Quantization (PQ)
- Metadata filtering 

- Pinecone, Weaviate, Qdrant, pgvector 

## Semantic Search 

- Traditional search: `keyword -> Documents`. Semantic search: `Meaning -> Documents`

## Building our own RAG Service 

We'll implement everything ourselves: 

- Upload document
- Extract text
- Chunk
- Generate embeddings 
- Store vectors
- Search 
- Retrieve
- Answer with citations 

No LangChain initially. 

## LangChain 

- DocumentLoader
- TextSplitter
- Embeddings
- Retriever
- Chains
- Memory
- Agents 

