## API Gateway 

- An API Gateway is a single entry point for all client requests in a microservices architecture. 

    Instead of the client talking directly to every microservice, it talks only to the API Gateway. 

```js
        Client
           │
           ▼
      API Gateway
       /    |    \
      ▼     ▼     ▼
 Auth     File   Interview
Service  Service  Service
```

The client never directly communicates with the individual services. 

## Why do we need an API Gateway? 

- Without an API Gateway, the frontend must know where every service lives. 

- Example: 

```js
React App

Login
↓
http://localhost:3001

Upload File
↓
http://localhost:3002

Interview
↓
http://localhost:3003

Notification
↓
http://localhost:3004
```

**Problems:**

- Frontend needs to maintain many URLs
- Every service must expose itself publicly 
- Authenticatioon logic gets duplicated 
- Difficult to scale 
- Difficult to monitor request 

---

## With API Gateway 

The frontend only knows one URL. 

```js
React App
     │
     ▼
http://localhost:3000
```
The gateway routes requests internally. 

```js
/api/auth/*
        │
        ▼
 Auth Service

/api/files/*
        │
        ▼
 File Service

/api/interviews/*
        │
        ▼
 Interview Service
```

The frontend never knows where the services actually run. 

---- 

## Responsibilities of an API Gateway 

An API Gateway is responsible for: 

- Routing requests to the correct service 
- JWT Authentication 
- Authorization 
- Rate Limiting 
- Request Validation 
- Logging 
- Response Transformation
- Load Balancing (optional)
- API Versioning 
- CORS
- SSL Termination 

## Why not call Services directly? 

If we expose every service publically: 

```js
Internet
   │
   ├── File Service
   ├── Interview Service
   ├── Auth Service
   ├── Notification Service
```

Problems:

- Every service becomes publicly accessible.
- Every service needs CORS configuration.
- Every service must verify JWT.
- More attack surface.
- Harder to secure.

## With API Gateway 

Only one service is exposed. 

```js
Internet
     │
     ▼
API Gateway
     │
 ┌───┼─────────┐
 ▼   ▼         ▼
Auth File Interview
```

Everything else stays inside the private network. 

API Gateway becomes useful when:

- Multiple microservices exist.
- Multiple teams work on different services.
- Independent deployments are required.
- Centralized authentication is needed.
- Centralized logging and monitoring are required.

## What happens if we don't use an API Gateway?

Your application will still work.

However:

- Frontend manages multiple service URLs.
- Authentication logic gets duplicated.
- CORS must be configured everywhere.
- Logging becomes fragmented.
- Harder to scale.
- Harder to secure.
- Harder to version APIs.

As the number of services grows, maintenance becomes increasingly difficult.

- API Gateway isn't only for authentication. It acts as the front door of our entire backend: 

                    CLIENT
                      ↓
                API GATEWAY
          ┌───────────┼───────────┐
          ↓           ↓           ↓
        Auth        Mock        Chat
       Service    Interview    Service
                    ↓
                   RAG
                    ↓
                    AI


**Typical Responsibilities**

- Authentication - verify JWT
- Authorization / routing - decide where request goes 
- Rate limiting - prevent abuse 
- CORS
- Request validation 
- Request/response logging 
- Load balancing 
- API versioning 
- SSL/TLS termination 
- Hide internal service URLs/ports
- Potentially response transformation 

- Without API Gateway: Clients might do 

```js
Frontend → Auth :5000
Frontend → Mock :5008
Frontend → RAG :5007
Frontend → Chat :5004
Frontend → AI :5005
```

     Now every service becomes exposed and the frontend needs to know your entire backend architecture. 

- With API Gateway: 

Frontend
   ↓
api.example.com
   ↓
Gateway
   ├── /auth/*
   ├── /mock-interviews/*
   ├── /chat/*
   ├── /files/*
   └── /interviews/*

   The frontend only knows one backend entry point. 