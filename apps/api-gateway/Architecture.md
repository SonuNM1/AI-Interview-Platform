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