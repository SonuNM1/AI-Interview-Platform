
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

# AI Software Categories 

AI software can be divided into different categories based on the problem they solve. 

## 1. AI Chat Assistants 

- Examples: ChatGPT, Claude, Gemini, Microsoft Copilot 

- Purpose: Answer user questions in natural language while maintaining conversation history. 

- Features: Chat, Conversation History, Streaming responses, Stop generation, Regenerate response, File Upload, Voice support 

- Technologies used: LLM, Streaming, Conversation memory, RAG, Tool calling 

## 2. AI Coding Assistants 

- Examples: Cursor, GitHub Copilot, Windsurf, Amazon Q Developer 

- Purpose: Understand source code and help developers write, explain, debug, and refactor code. 

- Features: Code completion, Bug fixing, Code explanation, File editing, Project understanding 

- Technologies used: Code RAG, Embeddings, Tool Calling, MCP, AST Parsing 

## AI Enterprise Search 

- Examples: Glean, Notion AI, Slack AI, Confluence AI 

- Purpose: Search internal company knowledge. Instead of asking Google, employees ask: 

    What is our leave policy? The AI searches company documents before answering. Technologies used: RAG, Embeddings, Vector database, Semantic search. 

## 4. AI Customer Support 

- Examples: Intercom AI, Zendesk AI, Freshworks AI 

- Purpose: Automatically answer customer questions 

- Example: Where is my order? Instead of guessing, the AI queries the Order Management System. 

- Technologies used: Tool Calling, APIs, CRM Integration, RAG

## 5. AI Document Assistants 

- Examples: ChatPDF, NotebookLM, Adobe Acrobat AI 

- Purpose: Understand uploaded documents

- Users upload: PDF, DOCX, PPT, TXT

    Then ask questions about them. 

- Technologies used: RAG, OCR, Embeddings, Vector Search 

## 6. AI Voice Assistants 

- Examples: Siri, Alexa, Google Assistant, ChatGPT Voice

- Purpose: Interact using speech instead of text 

- Technologies used: Speed-to-Text, LLM, Text-to-Speech, Streaming 

## 7. AI Image Generation 

- Examples: Midjourney, DALL.E, Stable Diffusion 

- Purpose: Generate images from text prompts 

- Technologies used: Diffusion models

## 8. AI Video Generation 

- Examples: Sora, Veo, Runway 

- Purpose: Generate videos from text prompts 

- Technologies used: Video diffusion models 

## 9. AI Agents 

- Purpose: Instead of only answering, the AI performs actions. 

- Example: Book a flight

- The AI: Searches flights, compare prices, fills forms, books tickets 

- Technologies used: LLM, Tool Calling, Planning, Memory 

## 10. Multi-Agent Systems 

- Instead of one AI, multiple specialized AIs work together. 

- Example: Interview Platform

    Coordinator Agent -> HR Agent -> Coding Agent -> Resume Agent -> Feedback Agent -> Final Evaluation 

    Each agent performs one specialized task. 



# What is RAG (Retrieval-Augmented Generation)

RAG is an AI architecture where a Large Language Model (LLM) retrieves relevant external information before generating a response. 

Instead of relying only on what it learned during training, the model is given additional context from your own documents, database, PDFs or knowledge base. 

- Think of RAG as an "Open Book Exam".

- Without RAG: `User -> LLM -> Answer`

    The model answers only from what it remembers. 

- With RAG: `User -> Search relevant documents -> Provide retrieved context -> LLM -> Answer`

    The LLM first reads the relevant information and then answers. 

## Why was RAG introduced? 

LLMs have limitations. 

For example - "Summarize the employee leave policy from our company's HR handbook." 

The LLM has never seen your company's private handbook. 

- Without RAG it may: Guess, Hallucinate, Give generic HR policies 

- With RAG: Search the handbook, Retrieve the correct pages, Answer using those pages  

## Real-World Example 

Imagine ChatGpt is a student. 

Without RAG: 

    Teacher - What is our company's refund policy? 

    Student - I don't know...maybe 30 days.

    The student guesses. 

With RAG: 

    Teacher - What is our company's refund policy? 

    Student: Let me open the company handbook... 

    (Reads handbook)

    The refund period is 15 days. 

    Now the answer comes from the handbook instead of memory. 

## RAG Pipeline (High Level)

User Question -> Search Knowledge Base -> Retrieve relevant documents -> Send documents + Question to LLM -> Generate final answer 

    The rerievel step heappens before generation 

## Why RAG is Powerful 

RAG allows an LLM to answer questions about information that was never part of its training. 

Examples include: Company documentation, HR policies, Product manuals, Internal wikis, Research papers, Legal documents, Medical guidelines, Customer support knowledge bases

    The LLM does not memorize these documents. It reads the relevant parts when needed. 

## Common Use Cases: 

### Customer Support Chatbots 

Retrieve answers from: FAQs, Help center articles, Manuals 

### Internal Company AI 

Employees ask: Leave policy, Office timings, Expense Reimbursement, Engineering documentation 

### AI PDF Chat 

Upload: Books, Research papers, Contracts, Reports 

    Ask questions naturally 

### AI Code Assistant 

Retrieve: Internal APIs, Coding standards, Documentation 

    Generate accurate answers based on your codebase. 

## What RAG doesn't do 

RAG doesn't train the LLM. It does not modify the model's weights. It simply provides relevant information at runtime. 

## Production Architecture 

User -> API/Backend -> Embedding Search -> Vector Database -> Top Matching Chunks -> LLM API -> Final Response 

- When a user asks a question: 

1. Generate an embedding for the query 
2. Search the vector database 
3. Retrieve the most relevant chunks 
4. Send those chunks along with the question to the LLM 
5. Return the generated answer 

## Common Misconceptions 

- RAG trains the model: False, RAG only retrieves information before generation

- The LLM remembers uploaded documents forever: False 

    Documents are stored separately (typically in a vector database). They are retrieved only when needed. 

- RAG replaces databases: False 

    RAG complements databases. Traditional databases still store application data, while vector databases store embeddings for semantic search. 

**What is RAG?**

A technique that retrieves relevant external information before sending it to an LLM so the model can generate more accurate, up-to-date, and domain-specific answers. 

**Why is RAG used?**

To reduce hallucinations and allow the LLM to answer questions using private or frequently changing data without retraining the model. 

**Does RAG train the LLM?**

No. It retrieves context at runtime and does not update the model's parameters. 

**Give examples of RAG application**

- Chat with PDFs
- Customer support bots 
- Internal company assistants
- AI documentation search 
- Enterprise knowledge bases 

**What we MUST remember**

- RAG = Retrieval + Generation 
- Retrieval happens before the LLM generates an answer
- The LLM does not learn new information; it reads retrieved context at runtime 
- RAG is ideal for private, dynamic, or domain-specific knowledge
- A typical RAG pipeline is: `User -> Retrieve -> LLM -> Answer`


# Why LLMs Hallucinate 

## What is Hallucination?

A hallucination occurs when an LLM generates information that sounds correct and confident but is actually incorrect, fabricated, or unsupported by facts. 

The model isn't intentionally lying-it is predicting the most likely sequence of words based on patterns it learned during training. 

## The Big Misconception 

- ChatGPT searches its memory like Google. 

    This is false. 

    An LLM does not have a database of facts that it looks up. Instead, it predicts the next token (word or sub-word) based on probability. 

    Think of it like autocomplete-but incredibly advanced. 

## Generation vs Retrieval 

### Retrieval

A search engine works like this: `Question -> Search Database -> Find Exact Information -> Return result`

    Example: SELECT * FROM policies WHERE name='Refund'

    The answer exists in storage 

### Generation 

An LLM works like this: `Question -> Predict next token -> Predict Next Token -> Predict Next Token -> Complete Sentence`

    It is creating the answer on token at a time. 


## Why Hallucinations happen 

There are several common reasonss

1. Missing Knowledge 

Suppose you ask - What is the leave policy at Acme Corp? 

    If Acme's policy wasn't part of the model's training data, it has no real knowledge of it.

    Instead, it may produce a generic leave policy that sounds believable.

2. Outdated Knowledge 

Imagine the model was trained in 2024

You may ask - Who won the IPL in 2026? 

    The model cannot know something that happened after its training. Without external information, it may guess. This is one reason RAG is useful for frequently changing information.

3. Similar Patterns 

Suppose many companies have a 30-day refund policy. You ask about a company whose policy is actually 15 days. 

    The model may answer - 30 days, because that pattern is statistically common, not because it verified the company's policy.

4. Ambiguous Questions 

Question - Tell me about Java. 

    Does "Java" mean: java programming language? java island? java coffee? 

    Without context, the model has to make a best guess. 

5. Overconfidence 

LLMs are optimized to generate fluent language. They do not naturally know when they should say: "I dont know"

    As a result, they often provide a confident-sounding answer even when uncertain.

    Modern models are much better at expressing uncertainty than earlier ones, but this behavior can still occur.

**Why This Is a Problem**

Hallucinations are especially risky in domains like: 

- Healthcare
- Finance 
- Legal advice 
- Internal company documentation 
- Compliance
- Enterprise Search 

**How RAG helps**

Without RAG: `Question -> LLM -> Guess based on training`

With RAG: `Question -> Retrieve relevant documents -> Provide Context -> LLM -> Generate answer using retrieved information`

- What is hallucination in an LLM? 

    A hallucination is when an LLM generates information that is false, fabricated, or unsupported by facts while presenting it as if it were true. 

- Why do LLMs hallucinate? 

    Because they generate text by predicting the next token based on learned patterns, not by verifying facts against a database. 


# Context Window 

## What is a Context Window? 

A context window is the maximum amount of information an LLM can process in a single request. 

    Think of it as the model's working memory during one conversation or API call. 

    Everything the model needs to answer must fit inside this window. 

## Important Clarification 

Many people confuse context window with memory. They are not the same. 

**Context Window:**

- Exists only for the current request
- Includes everything sent to the model
- Is forgotten after the request ends

### Memory

- Memory (if implemented by the application) is stored separately and can be injected into future prompts. 

- The LLM itself doesn't permanently remember what u tell it through the context window. 

## What Fits Inside the Context Window? 

Whenever you call an LLM API, the context window contains things like: 

- System prompt
- Developer prompt (if any)
- Conversation history 
- User Question 
- Retrieved RAG Documents
- Tool Results
- Images (for multimodal models)
- The model's generated response 

Everything shares the same limited space. 

## Example 

Suppose your model supports **128 tokens**

Your request contains: 

```js
System Prompt - 5k 
Conversation - 20k 
Retrieved Documents - 70k 
User Question - 500
Expected answer - 10k 

Total: 105 tokens
```

This fits. Now image your retrieved documents become: `140k tokens`

Now the request exceeds the context window. The model cannot process all of it. 

## How RAG uses the Context Window 

- Without RAG: `Question -> LLM`

    The LLM only sees the question

- With RAG: `Question -> Retrieve Top Documents -> System Prompt + Retrieved Chunks + Question -> LLM -> Answer`

    Only the most relevant chunks are placed into the context window. 

- What is a Context Window? 

    The maximum amount of information an LLM can process in a single request. 

- Why can't we send an entire book to an LLM? 

    Because context windows are limited, and processing very large inputs increases cost, latency, and may exceed the model's limits

- Why is chunking needed? 

    Large documents are split into smaller chunks so they can be embedded, searched efficiently, and selectively included in the context window. 


# Chunking 

Chunking means splitting a large document into smaller pieces. 

- Chunking = splitting large text into smaller searchable pieces. 

- Example: PDF (100 pages) -> Chunk 1, Chunk 2, Chunk 3, Chunk 4 ... 

    Why? 

    LLMs and embedding models cannot efficiently process huge documents at once. Instead of storing one 100-page document, we store hundreds of small chunks. 

- Why Chunking is required? 

    Because large documents are split into smaller searchable units so relevant information can be retrieved efficiently. 


# Embeddings 

Embeddings are numerical representations (vectors) of text. They convert meaning into numbers. 

- Example: "I love dogs" -> [0.12, -0.45, 0.81, ...]

    Thousands of numbers. 

    Why? 

    Computers don't understand language. They understand numbers. Embeddings allows computers to compare the meaning of sentences. 

- Why do we generate embeddings? 

    To perform semantic search by comparing the meaning of text rather than exact words. 

    Embeddings do not store knowledge. They capture semantic similarity. 


# Why Fine-Tuning Isn't Always the Answer 

Fine-tuning means training an existing LLM on your own dataset so it learns new behaviour or a specific style. 

### Why not just fine-tune for company documents? 

Because company documents change frequently. 

- Example:

    Today:
    Refund policy = 15 days

    Next month:
    Refund policy = 30 days

    Would you retrain the model every month? No. 

## Problems with Fine-Tuning

- Expensive
- Time-consuming
- Needs ML expertise
- Doesn't update instantly
- Not suitable for frequently changing data

## Where RAG Wins

RAG stores documents outside the LLM.

When a document changes:

Update the document in your vector database.

No model retraining is required.

## When to Use Fine-Tuning

Use it when you want to change **how** the model behaves.

Examples:

- Customer support tone
- Medical writing style
- Legal drafting style
- Output format
- Domain-specific terminology

## When to Use RAG 

Use it when you want the model to answer questions from:

- PDFs
- Company documents
- Internal wiki
- Knowledge base
- Frequently changing information

## Quick Comparison

| Fine-Tuning | RAG |
|-------------|-----|
| Changes model behavior | Retrieves external knowledge |
| Requires retraining | No retraining |
| Expensive | Relatively inexpensive |
| Good for style | Good for facts |
| Static knowledge | Dynamic knowledge |

- Why is RAG preferred over fine-tuning for enterprise knowledge base? 

    Because enterprise data changes frequently. RAG retrieves the latest documents without retraining the model, making it cheaper, faster and easier to maintain. 


# RAG vs Fine-Tuning 

### Difference 

| RAG | Fine-Tuning |
|------|-------------|
| Gives the model new information | Changes the model's behavior |
| Retrieves documents at runtime | Trains the model beforehand |
| Great for changing knowledge | Great for changing style |
| No retraining required | Requires retraining |
| Easy to update | Expensive to update |

### Example 

Imagine you're building an AI chatbot for your company. 

- Requirement 1: Answer questions from - HR policy, Company wiki, PDFs 

    Use RAG

- Requirement 2: Always respond politely in legal language 

    Use Fine-Tuning 

- RAG answers: What should the model know 

- Fine-Tuning answers: How should the model respond 

- RAG = Knowledge, Fine-Tuning = Behavior 

# Why Similar Meanings Are Close Together 

- The Question: How does the model know that - "I love programming" and "I enjoy coding" mean almost the same thing? 

- The Answer: Embedding models are trained on billions of sentences.

    During training, they learn that words and sentences appearing in similar contexts usually have similar meanings. 

- For example: "I love programming", "I enjoy coding" - These sentences often appear in similar contexts like: Software development, JavaScript, Python, Developers. 

    The model learns that "programming" and "coding" are closely related.

- The model does not understand language like humans. It learns statistical relationships from huge amounts of text. 

    Words and sentences used in similar situations end up close together in vector space. 

- Embeddings don't store facts. They store relationships between meanings. 


# Semantic Search 

Semantic search finds documents based on **meaning**, not exact words. 

### Traditional Keyword Search 

- Imagine your PDF contains: "Our office remains closed on Sundays."

    User searches: "Is the office open on weekends?"

    Keyword search looks for: office, open, weekends 

    The word "weekends" doesn't exist. 

    Result: No match (or poor match) 

### Semantic Search 

First, the user's question is converted into an embedding: `Question -> Embedding -> Compare with stored document embeddings -> Find the closest meanings`

- The chunk: "Our office remains closed on Sundays." - is retrieved because "weekends" and "Sundays" have similar meanings in context. 

### Another Example 

- Document: "The employee is entitled to 12 casual leaves."

    User asks: "How many vacation days do employees get?"

    Keyword search: Doesn't find "vacation"

- Semantic search: Understands that "vacation days" and "casual leaves" are related. 

- `Document -> Chunk -> Embedding -> Store in Vector Database`

- `User Question -> Embedding -> Compare with stored embeddngs -> Return nearest vectors -> Send chunks to LLM -> Answer`

### Why Embeddings are Required 

- Computers cannot compare meaning directly. Instead, they compare vectors. 

- If two vectors are close together, their meanings are considered similar. 

- `Upload PDF -> Extract Text -> Chunking -> Generate Embeddings -> Store in Vector DB`


# Vector 

Let's forget AI for a minute. A vector is just a list of numbers. 

```js
[1, 5, 2]

[10, -3, 8]

[0.12, -0.45, 0.91]
```

- In embeddings, a vector can have hundreds or thousands of numbers. 

- Example: `"I love programming" -> [0.12, -0.45, 0.91, 0.33, -0.11, ...]`

    These numbers are called an embedding vector. 

### Why a Vector? 

Imagine 3 students: 

| Student | Maths | Science | English |
| ------- | ----: | ------: | ------: |
| A       |    90 |      95 |      85 |
| B       |    91 |      94 |      84 |
| C       |    20 |      30 |      25 |


- Each student's marks can be represented as a vector.

```js
A = [90,95,85]

B = [91,94,84]

C = [20,30,25]
```

- A and B are very similar. A and C are very different. Embeddings work the same way. Instead of marks, each number represents a learned feature of the sentence. You don't know what each number means individually, but together they describe the sentence.


## What is a Vector Database? 

A Vector Database is simply a database optimized for storing and searching vectors. 

| Database                         | Best For                 |
| -------------------------------- | ------------------------ |
| MySQL                            | Tables                   |
| PostgreSQL                       | Relational data          |
| MongoDB                          | JSON Documents           |
| Redis                            | Cache                    |
| **Pinecone / Qdrant / Weaviate** | Vector similarity search |


## Can MongoDB do this? 

Yes, modern MongoDB supports vector search. So you might hear:

- MongoDB Atlas Vector Search
- PostgreSQL + pgvector
- Pinecone
- Qdrant
- Weaviate

They're all solving the same problem: efficient vector similarity search.

    The difference is that some are general-purpose databases with vector capabilities (MongoDB, PostgreSQL + pgvector), while others are specialized vector databases (Pinecone, Qdrant, Weaviate).

### How does Vector Search work? 

User asks: `How many vacation days do employees get?`

    Your backend generates an embedding: [0.15,0.41,-0.95...]

- The Vector DB compares this vector with all stored vectors 

    Question Vector -> Compare -> Chunk 1 (95%), Chunk 2 (12%), Chunk 3 (18%)

    It returns Chunk 1 because it's the closest in meaning. 



# Cosine Similarity

Let's think in terms of the direction. 

- Imagine these two arrows: 

    Sentence A -> 
    Sentence B -> 

    They're pointing in almost the same direction. 

    Meaning: very similar. 

- Now imagine: 

    Sentence A  →
    Sentence C  ↑

    Different directions. Less similar. 

- Cosine Similarity measures how similar the directions of two vectors are, not how big they are. 

    A higher cosine similarity means the vectors point in nearly the same direction, which usually indicates similar meaning. 

    That's why it's the most common similarity metric for embeddings. 

**Why can't we use a normal SQL Query?**

Because you're not looking for an exact match. 

You're looking for the most similar vector, which requires specialized indexing and search algorithms. 


# Are RAG, Tool Calling, MCP, and Agents Connected? 

Yes, they are related because they are all components used to build modern AI applications. However, they solve different problems. You can think of them as different capabilities that an AI application may or may not use depending on the use case. 

- RAG helps an AI access external knowledge.  Tool calling helps an AI perform actions. Agents help an AI plan and coordinate multiple steps. 

    MCP provides a standardized way to connect AI to external tools and services. 

- A single AI application can use one of these, several of them, or all of them together. 


# Tool Calling 

- Tool calling (also called Function Calling) is the ability of an LLM to request the execution of a function instead of generating a text response. 

- By default, an LLM can only generate text. It cannot check the current weather, query a database, send an email, or book a meeting. Those operations require access to external systems. 

- With tool calling, we define a set of functions that our application exposes. During a conversation, if the model determines that one of these functions is needed to answer the user's request, it returns a structured function call instead of a normal text response. Your backend executes the function, collects the result, and sends that result back to the model so it can generate the final answer. 

- For example, if the user asks "What's the weather in Delhi?", the model doesn't know the live weather. Instead, it requests a call to a function such as `getWeather("Delhi")`. Your Node.js backend executes that function, receives the weather data from an API, and provides it to the model. The model then replies using the live data. 

- Tool calling is therefore about giving an LLM the ability to interact with external systems, not about giving it knowledge. 

### How is Tool Calling Different from RAG? 

Although both involve external data, they solve completely different problems.

- RAG retrieves information from a knowledge source, such as PDFs, documentation, or a vector database. The retrieved information becomes part of the prompt sent to the LLM.

- Tool calling, on the other hand, executes an operation. That operation might fetch live weather, create a calendar event, query a database, send an email, or update a CRM.

- A simple way to distinguish them is this:

    If the AI needs to read information, it uses RAG.

    If the AI needs to do something, it uses tool calling.


# AI Agents 

- An AI agent is an application that allows an LLM to reason about a task, decide what actions are required, and use one or more tools to complete that task.

- Unlike a simple chatbot that receives a question and immediately produces an answer, an agent can perform multiple intermediate steps before responding.

- For example, suppose a user asks: "Plan my business trip to Bangalore next week."

    A normal chatbot may simply generate an itinerary from its existing knowledge.

- An AI agent may instead decide to:

    Check flight availability.
    Search for hotels.
    Check the weather forecast.
    Read the user's calendar.
    Create a travel schedule.
    Present the final plan.


# MCP (Model Context Protocol)

MCP is an open standard that defines how AI applications communicate with external tools and data sources. 

- Before MCP, every AI application needed custom code to integrate with services such as GitHub, Slack, PostgreSQL, Google Drive, or Gmail. Every integration had its own API, authentication method, and implementation. 

- MCP standardizes this communication. Instead of every AI provider building different integrations for every service, MCP defines a common protocol that both AI applications and external services can understand. 

- You can think of MCP as being similar to HTTP for web applications for web communication or JDBC for Java Database Connectivity. It doesn't replace APIs; it provides a standard way for AI systems to discover and use them. 

### How Everything Works Together 

In a production AI application, these technologies often work together rather than replacing one another. 

- Suppose a user asks: "According to our HR policy, apply casual leave for tomorrow" 

    The application may first use RAG to retrieve the company's leave policy from its documentation. After reading the policy, the LLM decides that it has enough information to proceed. It then uses tool calling to invoke the company's leave management API and submit the leave request. If the application is designed as an AI agent, it can decide this sequence of steps automatically. If the leave management system is exposed through MCP, the agent can access it using the standardized protocol rather than a custom integration. 


## How is Tool Calling actually Implemented? 

There is no special framework required. Tool calling is a feature provided by the LLM API (OpenAI, Anthropic, Gemini, etc). 

- For Example: As a Full Stack Developer, we write normal backend functions. In your Node.js application we might have: 

```js
async function getWeather(city: string) {
  // Call weather API
}

async function createMeeting(date: string) {
  // Google Calendar API
}

async function sendEmail(to: string, subject: string) {
  // Gmail API
}
```

- When we make a request to an LLM, we also send a description of these functions (their names, parameters and what they do)

- The LLM never executes the code, the backend executes the code. The LLM only decided which function should be called. 

### Do Frameworks help? 

Yes. Without frameworks, we write the orchestration by ourself. 

- Popular options include: OpenAI Agents SDK, LangGraph, Google ADK, Crew AI, LlamaIndex Workflows 

    These frameworks make multi-step workflows easier, but they still rely on the same underlying idea; the LLM requests a tool, and your application executes it. 


## How is MCP implemented? 

# LangChain & LangGraph 

# Hugging Face 