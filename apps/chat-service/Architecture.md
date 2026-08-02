# Chat Service

## Overview

The Chat Service is a production-grade, real-time communication service for the AI Interview Platform. It enables persistent conversations between candidates, AI Mentors, and professional mentors while providing a modern messaging experience with real-time updates, message history, and scalable architecture.

---

## Primary Use Cases

### 1. AI Mentor Conversations

Every candidate has access to an AI Mentor that acts as a personalized career coach throughout their interview journey.

Unlike a generic chatbot, the AI Mentor can understand the candidate's interview history, coding assessments, resume, strengths, weaknesses, progress, and previous conversations to provide personalized guidance.

Candidates can use the AI Mentor to:

- Ask technical questions
- Review resumes
- Analyze coding mistakes
- Practice interview questions
- Conduct mock interviews
- Receive personalized learning recommendations
- Track interview preparation progress

---

### 2. Professional Mentorship Conversations

Candidates can book one-on-one mentorship sessions with experienced software engineers, hiring managers, or interview coaches.

Once a mentorship session is successfully booked and paid for, a dedicated chat is automatically created between the candidate and the mentor.

The conversation can be used to:

- Discuss interview preparation
- Review resumes
- Share code snippets
- Exchange files and documents
- Discuss system design
- Continue discussions after mentorship sessions

This ensures communication remains structured, secure, and directly associated with a booked mentorship session.

---

## Core Features

- Real-time messaging using WebSockets
- Persistent conversation history
- Typing indicators
- Online/Offline presence
- Last seen status
- Message delivery status
- Read receipts
- Message editing
- Message deletion
- File attachments via File Service
- Message pagination
- Scalable architecture using Redis Pub/Sub
- Event-driven communication using RabbitMQ

---


## WebSocket 

WebSocket is just a protocol. It gives you a pipe. 

Socket.IO builds an entire communication framework on top of it. 

- WebSocket: Low-level communication protocol 

- Socket.IO: high-level library built on top of WebSocket 

- HTTP is built on TCP, similarly WebSocket -> Socket.IO