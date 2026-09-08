import { Router } from "express";
import {
  createUser,
  deleteUserController,
  getMentor,
  getMentorRatingList,
  getMentors,
  getMyMentor,
  getMyProfile,
  getUser,
  rateMentor,
  searchCandidates,
  updateMyMentor,
  updateUser,
  uploadAvatarController,
  uploadResumeController,
} from "../controllers/user.controller.js";
import upload from "../config/multer.config.js";

const router: Router = Router();

router.get("/me", getMyProfile);

router.patch(
  "/me/avatar",
  upload.single("file"),
  uploadAvatarController,
);

router.patch(
  "/me/resume",
  upload.single("file"),
  uploadResumeController,
);

// candidate search route 

router.get("/candidates/search", searchCandidates)

// mentor marketplace routes must come before the generic "/:id" route 

router.get("/mentors", getMentors) ; 
router.get("/mentors/me", getMyMentor);
router.patch("/mentors/me", updateMyMentor);

// single mentor profile 

router.get("/mentors/:id", getMentor)

// mentor ratings 

router.get("/mentors/:id/ratings", getMentorRatingList) ; 

// candidate creates/updates a mentor rating 

router.post("/mentors/:id/ratings", rateMentor) ; 

router.get("/:id", getUser);

router.patch("/:id", updateUser);

router.delete("/delete-user/:id", deleteUserController);

export default router; 