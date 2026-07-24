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