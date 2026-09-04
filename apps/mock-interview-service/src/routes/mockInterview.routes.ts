import { Router } from "express";
import { createMockInterview, endMockInterview, getMockInterview, getMockInterviewHistory, skipMockInterviewQuestion, startMockInterview, submitMockInterviewAnswer } from "../controllers/mockInterview.controller.js";
import { uploadAudio } from "../middleware/upload.middleware.js";

const router = Router() ; 

// creating a new mock interview 

router.post("/", createMockInterview) ;

// Get previous mock interviews.

router.get("/history", getMockInterviewHistory);

// Start mock interview and generate Question 1

router.post("/:id/start", startMockInterview);

// submit voice answer 

router.post("/:id/answer", uploadAudio.single("audio"), submitMockInterviewAnswer);

// skip current question 

router.post("/:id/skip", skipMockInterviewQuestion);

// manually end the interview 

router.post("/:id/end", endMockInterview);

// get one mock interview with questions and report 

router.get("/:id", getMockInterview);

export default router ; 