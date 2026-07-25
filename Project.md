Designing the platform using microservices architecture where each service owns a single business capability and its own database. 

An API Gateway acts as the single entry point for clients, handling routing, authentication, and request forwarding. 

Services communicate synchronously using REST APIs and asynchronously using RabbitMQ for background tasks. 

PostgreSQL is used for strongly relational data like users and authentication, while MongoDB stores flexible interview and chat documents. 

Redis provides caching, Pub/Sub, and rate limiting. 

Files are stored in AWS S3 and delivered through CloudFront. 

Every service is containerized using Docker, deployed independently, and monitored with centralized logging and error tracking. 

This architecture improves scalability, fault isolation, maintainability and independent deployments. 

- monolith vs monorepo 

- pnpm-workspace.yaml

- docker compose 

- DBeaver 

- Prisma 

| Service                | Database                      | Why                                                                           |
| ---------------------- | ----------------------------- | ----------------------------------------------------------------------------- |
| Auth Service           | PostgreSQL                    | Authentication data is highly relational and transactional.                   |
| User Service           | PostgreSQL                    | User profiles, relationships, constraints.                                    |
| Interview Service      | MongoDB                       | Interview questions, AI feedback, transcripts, and nested documents fit well. |
| Chat Service           | MongoDB + Redis               | Chat messages are document-like; Redis is for pub/sub and caching.            |
| Search Service         | Elasticsearch                 | Full-text search and filtering.                                               |
| File Service           | AWS S3                        | Store files, not database blobs.                                              |
| Notification Service   | RabbitMQ                      | Message broker, not a database.                                               |
| Analytics Service      | PostgreSQL (initially)        | Aggregate data; we can optimize later if needed.                              |
| AI Service             | No primary database initially | Mostly orchestrates LLM calls; can persist prompts/history later if needed.   |
| Code Execution Service | No database initially         | Executes code inside containers; stores results elsewhere if required.        |

- Migration in PostgreSQL and MongoDB


## RabbitMQ 

RabbitMQ is a message broker. Instead of one service directly calling another over HTTP, it acts as a middleman that stores and forwards messages between services. 

Instead of: Auth Service -> HTTP -> User Service 

We have: `Auth Service -> Publish Event -> RabbitMQ -> Consume Event -> User Service`

    The services become indepedent. 

**Concepts**

Producer -> Exchange -> Routing -> Queue -> Consumer 

- Producer: Publishes a message.

- Exchange: Receives messages from producers and decides where to send them. 

- Queue: Stores messages until someone consumes them. 

    Even if User Service is offline, the message waits in the queue. 

- Consumer: Reads messages from the queue. 