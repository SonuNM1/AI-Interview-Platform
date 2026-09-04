import { Router } from "express";
import { createInterview, deleteInterview, getAllInterviews, getCandidateInterviews, getInterviewById, getInterviewReport, publishInterview, skipInterviewQuestion, updateInterview } from "../controllers/interview.controller.js";

const router: Router = Router() ;

router.post("/", createInterview) ;

router.get("/", getAllInterviews) ;

// get all interviews assigned to the authenticated candidate 

router.get("/candidate", getCandidateInterviews)

// get the completed report for a recruiter's interview 

router.get("/:interviewId/report", getInterviewReport)

router.get("/:id", getInterviewById) ;

router.put("/:id", updateInterview) ; 

router.delete("/:id", deleteInterview) ;

router.patch("/:id/publish", publishInterview) ; 

export default router; 