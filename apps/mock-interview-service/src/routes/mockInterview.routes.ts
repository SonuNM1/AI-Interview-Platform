import { Router } from "express";
import { createMockInterview, getMockInterview, startMockInterview, submitMockInterviewAnswer } from "../controllers/mockInterview.controller.js";

const router = Router() ; 

// creating a new mock interview 

router.post("/", createMockInterview) ;

// Start mock interview and generate Question 1

router.post("/:id/start", startMockInterview);

router.post("/:id/answer", submitMockInterviewAnswer);

router.get("/:id", getMockInterview);

export default router ; 