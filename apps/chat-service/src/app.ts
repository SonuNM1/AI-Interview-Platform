import express from "express";
import cors from "cors" ; 
import conversationRoutes from "./routes/conversation.routes.js"
import messageRoutes from "./routes/message.routes.js";
import attachmentRoutes from "./routes/attachment.routes.js";

const app = express();

app.use(cors()) ; 

app.use(express.json()) ; // parses incoming JSON requests

// health route 

app.get("/health", (_, res) => {
    res.status(200).json({
        success: true, 
        message: "Chat Service is running"
    })
})

// mounting routes 

app.use("/api/v1/conversations", conversationRoutes) ; 

app.use("/api/v1/messages", messageRoutes);

app.use("/api/v1/attachments", attachmentRoutes) ; 

export default app;