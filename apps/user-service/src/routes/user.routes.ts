import { Router } from "express";
import {
  createUser,
  deleteUserController,
  getMentor,
  getMentorRatingList,
  getMentors,
  getMyProfile,
  getUser,
  rateMentor,
  searchCandidates,
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

router.get("/candidates/search", searchCandidates)

router.get("/:id", getUser);

router.patch("/:id", updateUser);

router.delete("/delete-user/:id", deleteUserController);

// mentor discovery 

router.get("/mentors", getMentors) ; 

// single mentor profile 

router.get("/mentors/:id", getMentor)

// mentor ratings 

router.get("/mentors/:id/ratings", getMentorRatingList) ; 

// candidate creates/updates a mentor rating 

router.post("/mentors/:id/ratings", rateMentor) ; 

export default router; 