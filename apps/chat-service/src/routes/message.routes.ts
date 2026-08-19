import { Router } from "express";
import { createMessage, deleteMessage, editMessage, getConversationMessages, sendMessage } from "../controllers/message.controller.js";
import upload from "../config/multer.config.js";

const router: Router = Router() ;

router.post("/", createMessage) ; 

router.get("/:conversationId", getConversationMessages)

// edit message 

router.patch("/:messageId", editMessage);

// delete message 

router.delete("/:messageId", deleteMessage);

// Sends a chat message with an optional attachment. If a file is provided, the Chat Service first uploads it to the File Service, receives the uploaded file metadata, and then creates the chat message containing the attachment information.The frontend only needs to make a single request.

router.post("/send", upload.single("file"), sendMessage)

export default router; 