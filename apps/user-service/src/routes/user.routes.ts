import { Router } from "express";
import {
  createUser,
  deleteUserController,
  getMyProfile,
  getUser,
  updateUser,
  uploadAvatarController,
  uploadResumeController,
} from "../controllers/user.controller.js";
import upload from "../config/multer.config.js";

const router = Router();

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

router.get("/:id", getUser);

router.patch("/:id", updateUser);

router.delete("/delete-user/:id", deleteUserController);

export default router; 