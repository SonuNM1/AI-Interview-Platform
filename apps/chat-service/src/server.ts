import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import connectDB from "./config/db.js";
import jwt from "jsonwebtoken";
import { initializeSocket } from "./sockets/socket.js";
import { registerSocketEvents } from "./sockets/index.js";
import { AuthenticatedSocket } from "./types/socket.js";

const PORT = process.env.PORT || 5005;

const startServer = async () => {
  try {
    await connectDB();

    const httpServer = http.createServer(app);

    const io = new Server(httpServer, {
      cors: {
        origin: "*",
      },
    });

    io.use((socket, next) => {
      try {
        const token = socket.handshake.auth?.token;

        if (!token) {
          return next(new Error("Authentication required"));
        }

        const decoded = jwt.verify(
          token,
          process.env.JWT_ACCESS_SECRET!
        ) as {
          id: string 
        }

        if(!decoded.id) {
          return next(new Error("Invalid authentication token"))
        }

        (socket as AuthenticatedSocket).userId = decoded.id 

        next();
      } catch (error) {
        next(new Error("Invalid or expired access token"));
      }
    });

    initializeSocket(io);
    registerSocketEvents(io);

    httpServer.listen(PORT, () => {
      console.log(`Chat Service running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start Chat Service: ", error);
  }
};

startServer();
