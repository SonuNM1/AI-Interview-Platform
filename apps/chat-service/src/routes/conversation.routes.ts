import { Router } from "express";
import { createConversation, getUserConversations, getConversationMessages } from "../controllers/conversation.controller.js";

const router: Router = Router()

// create conversation 

router.post("/", createConversation) ; 

// returns all messages of a conversation 

router.get("/:conversationId/messages", getConversationMessages) ; 

// get user conversations 

router.get("/", getUserConversations) ; 

export default router ; 