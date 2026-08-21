import { Router } from "express";
import { chatWithMentor, stopMentorResponse, streamMentorResponse } from "../controllers/mentor.controller.js";

const router: Router = Router();

// chat with the ai mentor 

router.post("/chat", chatWithMentor)

// stream AI response 

router.post("/chat/stream", streamMentorResponse) ; 

// stop the current AI generation 

router.post("/chat/stop", stopMentorResponse) ; 

export default router;