import { Router } from "express";
import { createInterview, deleteInterview, getAllInterviews, getCandidateInterviews, getInterviewById, publishInterview, skipInterviewQuestion, updateInterview } from "../controllers/interview.controller.js";

const router: Router = Router() ;

router.post("/", createInterview) ;

router.get("/", getAllInterviews) ;

// get all interviews assigned to the authenticated candidate 

router.get("/candidate", getCandidateInterviews)

router.get("/:id", getInterviewById) ;

router.put("/:id", updateInterview) ; 

router.delete("/:id", deleteInterview) ;

router.patch("/:id/publish", publishInterview) ; 

// skip the current question when the candidate does not know the answer

router.post("/:accessToken/questions/skip", skipInterviewQuestion)

export default router; 