import { Router } from "express";
import { chatWithMentor } from "../controllers/mentor.controller.js";

const router = Router();

// chat with the ai mentor 

router.post("/chat", chatWithMentor)

export default router;