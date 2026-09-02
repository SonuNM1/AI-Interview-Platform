## Responsibilities 

- User Profile
- Avatar (AWS S3)
- Bio 
- GitHub
- LinkedIn
- Resume 
- Skills
- Experience 

- Phase 1: HTTP communication between services 

- Phase 2: Replace those HTTP calls with RabbitMQ events after the core services are working 

## Direct HTTP communication (Service-to-Service Communication)

Client -> Auth Service (Create email + password) -> (HTTP POST) User Service (Create Profile)

Auth Service literally calls: `POST http://user-service:3002/users`

    Advantages -> very easy, easy to debug, fast to build, perfect for getting the project working 

    Disadvantages -> Suppose user service is down. 

    Client -> Auth Service -> HTTP Request -> User Service Down 

    Now registration fails. Even though Auth Service worked. So services become  tightly coupled 

## Event driven communication (RabbitMQ) 

Instead of calling User Service directly: 

Client -> Auth Service -> Publishes Event -> RabbitMQ -> User Service 

Notice the difference. Auth Service doesn't know who will consume the event. It just says: "Someone registerd". 

RabbitMQ stores it. Whenever User Service is available

    RabbitMQ -> User Service -> Create Profile 


## Database migrations 

## Database migration workflow 

## Database design