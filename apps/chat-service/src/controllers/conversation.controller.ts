import { Request, Response } from "express";
import { createConversationService, getUserConversationsService } from "../services/conversation.service.js";
import { getConversationMessagesService } from "../services/message.service.js";

// creates a conversation 

export const createConversation = async (
    req: Request, 
    res: Response 
): Promise<Response> => {
    try {
        const {participants, isGroup, title} = req.body ;

        const conversation = await createConversationService(
            participants, 
            isGroup, 
            title 
        ) ; 

        return res.status(201).json({
            success: true, 
            data: conversation 
        })        
    } catch (error) {
        console.error("Create conversation error: ", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create conversation."
        });
    }
}

// return user's conversations 

export const getUserConversations = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId  = req.params.userId ;

        const conversations =
            await getUserConversationsService(
                userId
            );

        return res.json({
            success: true,
            data: conversations
        });
    } catch (error) {
        console.error("Get user conversation error: ", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch conversations."
        });
    }
}

// returns all messages of a conversation 

export const getConversationMessages = async (
    req: Request, 
    res: Response 
) => {
    try {
        const {conversationId} = req.params ; 

        console.log("Controller Conversation ID:", conversationId);

        const messages = await getConversationMessagesService(conversationId) ; 

        return res.json({
            success: true, 
            data: messages 
        })

    } catch (error) {
        console.error(
            "Get conversation messages error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch messages.",
        });
    }
}