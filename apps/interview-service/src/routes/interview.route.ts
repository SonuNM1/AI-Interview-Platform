import { Router } from "express";
import { createInterview, deleteInterview, getAllInterviews, getInterviewById, updateInterview } from "../controllers/interview.controller.js";

const router = Router() ;

router.post("/", createInterview) ;

router.get("/:id", getInterviewById) ;

router.get("/", getAllInterviews) ;

router.put("/:id", updateInterview) ; 

router.delete("/:id", deleteInterview)

export default router; 