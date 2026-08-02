import dotenv from "dotenv";
dotenv.config();

import http from "http" ; 
import { Server } from "socket.io";
import app from "./app.js";
import connectDB from "./config/db.js";

import { initializeSocket } from "./sockets/socket.js";
import { registerSocketEvents } from "./sockets/index.js";

const PORT = process.env.PORT || 5005;

const startServer = async () => {
    try {
        await connectDB();

        const httpServer = http.createServer(app) ;

        const io = new Server(httpServer, {
            cors: {
                origin: "*"
            }
        })

        initializeSocket(io) ;
        registerSocketEvents(io) ;

        httpServer.listen(PORT, ()=> {
            console.log(`Chat Service running on http://localhost:${PORT}`)
        })

    } catch (error) {
        console.error("Failed to start Chat Service: ", error) ; 
    }
};

startServer()