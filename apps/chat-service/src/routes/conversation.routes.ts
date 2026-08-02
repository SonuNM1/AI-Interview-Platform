import { Router } from "express";
import { createConversation, getUserConversations } from "../controllers/conversation.controller.js";

const router = Router()

// create conversation 

router.post("/", createConversation) ; 

// get user conversations 

router.get("/:userId", getUserConversations)

export default router ; 