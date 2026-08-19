import express from "express" ; 
import { Router } from "express";
import { getFirstQuestion, submitCandidateAnswer, getNextQuestion, submitInterview } from "../controllers/interviewQuestion.controller.js";

const router: Router = express.Router() ; 

router.post("/:accessToken/start-question", getFirstQuestion) ; 

router.post("/:accessToken/questions/answer", submitCandidateAnswer);

router.post("/:accessToken/questions/next", getNextQuestion);

router.post("/:accessToken/submit",submitInterview);

export default router ; 