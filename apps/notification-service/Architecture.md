## Responsibilities 

- Consume events from RabbitMQ 
- Generate Email Verification OTP 
- Store OTP in Redis with expiration 
- Send verification emails 
- Resend verification OTP 
- Send Forgot password OTP 
- Send password reset emails 
- Send welcome emails 
- Send account-related notifications 
- Handle email template 
- Track OTP resend count 
- Handle OTP expiration  
- Support future SMS notifications
- Support future Push Notifications 
- Consume future notification events from other services 

# RabbitMQ Queue vs Exchange

## What is a Queue?

A Queue is the simplest messaging component in RabbitMQ. It acts like a waiting line where messages are stored until they are consumed by a service. A producer sends a message to the queue, and one of the consumers connected to that queue processes the message.

A queue guarantees that **each message is processed only once**. Once a consumer successfully processes a message and acknowledges (ACKs) it, RabbitMQ removes that message from the queue.

Current flow:

Producer
        ↓
    Queue
        ↓
   Consumer

Example:

Auth Service
      ↓
user_created Queue
      ↓
User Service

After User Service processes the message, RabbitMQ deletes it from the queue.

---

# Competing Consumers Pattern

## What is it?

When multiple consumers are connected to the **same queue**, RabbitMQ distributes messages among them instead of sending every message to every consumer.

This is known as the **Competing Consumers Pattern**.

Example:

                Orders Queue

        ┌────────┴────────┐
        ▼                 ▼
   Worker 1          Worker 2

Order 1 → Worker 1

Order 2 → Worker 2

Order 3 → Worker 1

Order 4 → Worker 2

Every message is processed by only **one** consumer.

The consumers "compete" with each other to receive the next available message.

---

# Why RabbitMQ Works Like This

RabbitMQ was designed to distribute workload among multiple workers.

Instead of every worker processing the same message, RabbitMQ ensures that only one worker processes it.

Benefits:

- Prevents duplicate processing.
- Distributes workload evenly.
- Improves scalability.
- Increases throughput.

This is perfect for background jobs where each task should run exactly once.

Examples:

- Order Processing
- Image Processing
- PDF Generation
- Video Encoding
- Email Sending Workers
- Payment Processing

---

# The Problem We Faced

Initially, our architecture looked like this:

                user_created Queue

                       │
        ┌──────────────┴──────────────┐
        ▼                             ▼
   User Service            Notification Service

When a new user registered:

Auth Service published one message:

{
    "id": "...",
    "email": "user@gmail.com"
}

RabbitMQ stored this message inside the **user_created** queue.

Now both User Service and Notification Service were listening to the same queue.

Whichever service consumed the message first received it.

After processing, RabbitMQ removed the message from the queue.

The second service never received it.

In our case:

User Service received the event.

↓

Created the user profile.

↓

Acknowledged the message.

↓

RabbitMQ deleted the message.

↓

Notification Service never received anything.

As a result, no OTP email was generated.

---

# Why This Architecture Was Incorrect

Our registration event should trigger multiple independent actions.

When a user registers, we don't only want to create a profile.

We also want to:

- Create User Profile
- Send Verification Email
- Store Analytics
- Write Audit Logs
- Trigger Recommendation Engine
- Notify Admin (future)

These are independent business operations.

If only one service receives the event, the remaining operations never happen.

Therefore, using a single queue was not the correct design for our use case.

---

# What is an Exchange?

An Exchange is a message router.

Unlike a Queue, an Exchange does not store messages.

Its only responsibility is deciding **where a message should go**.

Producer
      ↓
 Exchange
      ↓
 Multiple Queues

The producer sends the message to the Exchange.

The Exchange copies or routes the message to one or more queues based on its routing rules.

Each service listens to its own queue.

---

# Exchange Based Architecture

Instead of:

Producer
     ↓
Queue
     ↓
Consumers

we use:

Producer
     ↓
Exchange
     ↓
Multiple Queues
     ↓
Consumers

Example:

                    user_events Exchange

               ┌────────┼────────┐
               ▼        ▼        ▼

        profile_queue  email_queue  analytics_queue

              │            │              │

              ▼            ▼              ▼

        User Service  Notification  Analytics Service

Now Auth Service publishes only **one** event.

RabbitMQ automatically copies that event into every bound queue.

Result:

- User Service receives it.
- Notification Service receives it.
- Analytics Service receives it.

All services execute independently.

---

# Advantages of Exchanges

- One event can be consumed by multiple services.
- Services remain completely independent.
- New services can be added without changing existing producers.
- Supports event-driven microservice architecture.
- Makes the system loosely coupled.
- Improves scalability and maintainability.

---

# Types of Exchanges

## 1. Direct Exchange

Routes messages based on an exact routing key.

Example:

Routing Key: user.created

Only queues listening to "user.created" receive the message.

Used when a message should go to a specific destination.

---

## 2. Fanout Exchange

Broadcasts every message to all connected queues.

Routing keys are ignored.

Example:

User Registered

↓

Every subscribed service receives the event.

Used for event broadcasting.

This is the exchange type we will use for our current project.

---

## 3. Topic Exchange

Routes messages using wildcard patterns.

Examples:

user.*

user.created

user.deleted

Useful when different services are interested in different categories of events.

This is the most commonly used exchange in large production systems.

---

## 4. Headers Exchange

Routes messages based on message headers instead of routing keys.

Less commonly used.

---

# Why We Are Moving to Exchanges

Today we have only:

- User Service
- Notification Service

Tomorrow we will have:

- Analytics Service
- Search Service
- Recommendation Service
- Audit Service
- Interview Service
- AI Service

Every one of these services may need to know when a user registers.

With an Exchange, Auth Service publishes the event only once.

RabbitMQ automatically distributes the event to every interested service.

This makes the architecture scalable, loosely coupled, and production-ready.

For these reasons, we are replacing our single queue architecture with an Exchange-based Publish–Subscribe architecture.