// Centralized URLs for all microservices. The API Gateway uses these URLs to forward incoming requests to the correct backend services 

import dotenv from "dotenv";
dotenv.config();

export const services = {
  auth: process.env.AUTH_SERVICE_URL!,
  user: process.env.USER_SERVICE_URL!,
  notification: process.env.NOTIFICATION_SERVICE_URL!,
  interview: process.env.INTERVIEW_SERVICE_URL!,
  file: process.env.FILE_SERVICE_URL!,
  chat: process.env.CHAT_SERVICE_URL!,
  ai: process.env.AI_SERVICE_URL!,
  rag: process.env.RAG_SERVICE_URL!,
  mockInterview: process.env.MOCK_INTERVIEW_SERVICE_URL!,
};