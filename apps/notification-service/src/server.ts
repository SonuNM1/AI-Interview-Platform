import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectRabbitMQ, consumeEvent } from "@repo/shared-rabbitmq";
import { connectRedis } from "@repo/shared-redis";
import { sendVerificationOTP } from "./services/email.service.js";
import { createOTP } from "./services/otp.service.js";
import { UserEventType } from "@repo/shared-rabbitmq";
import { connectDatabase } from "./config/database.js";
import { startInterviewNotificationConsumer } from "./consumers/interview.consumer.js";
import { consumeUserEvents } from "./consumers/user.consumer.js";


const PORT = process.env.PORT || 5002;

const startServer = async () => {
  try {
    await connectRedis();
    await connectRabbitMQ();
    await connectDatabase() ; 

    await consumeUserEvents() ; 

    // start consuming interview events for in-app notifications

    await startInterviewNotificationConsumer()

    app.listen(PORT, () => {
      console.log(`Notification Service running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
};

startServer();
