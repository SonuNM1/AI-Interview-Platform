import { Router } from "express";
import {createUser, deleteUserController, getMyProfile, getUser, updateUser} from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router()

console.log("User routes loaded...")

// Create empty user profile post registration - connected with Auth Service

router.post("/", createUser)

// Update existing user profile 

router.patch("/:id", authMiddleware, updateUser)

// Get profile 

router.get("/:id", getUser)

// delete user profile - deve only 

router.delete("/delete-user/:id", deleteUserController)

// Authenticated 

router.get("/me", authMiddleware, getMyProfile) ; 

export default router ; 