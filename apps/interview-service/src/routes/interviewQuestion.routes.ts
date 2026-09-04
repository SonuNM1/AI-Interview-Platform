import express from "express" ; 
import { Router } from "express";
import { getFirstQuestion, submitCandidateAnswer, getNextQuestion, submitInterview } from "../controllers/interviewQuestion.controller.js";
import { uploadAudio } from "../middleware/uploadAudio.middleware.js";
import { skipInterviewQuestion } from "../controllers/interview.controller.js";

const router: Router = express.Router() ; 

router.post("/:accessToken/start-question", getFirstQuestion) ; 

// candidate submits a recorded audio answer 

router.post("/:accessToken/questions/answer", uploadAudio.single("audio"), submitCandidateAnswer);

router.post("/:accessToken/questions/next", getNextQuestion);

router.post("/:accessToken/submit",submitInterview);

// skip the current question when the candidate does not know the answer

router.post("/:accessToken/questions/skip", skipInterviewQuestion);

export default router ; 