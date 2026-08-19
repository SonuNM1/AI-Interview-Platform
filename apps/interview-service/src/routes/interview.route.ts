import { Router } from "express";
import { createInterview, deleteInterview, getAllInterviews, getInterviewById, publishInterview, updateInterview } from "../controllers/interview.controller.js";

const router: Router = Router() ;

router.post("/", createInterview) ;

router.get("/:id", getInterviewById) ;

router.get("/", getAllInterviews) ;

router.put("/:id", updateInterview) ; 

router.delete("/:id", deleteInterview) ;

router.patch("/:id/publish", publishInterview) ; 

export default router; 