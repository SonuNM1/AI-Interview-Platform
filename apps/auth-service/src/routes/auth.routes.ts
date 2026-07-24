import { Router } from "express";
import { login, profile, refresh, register } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { logout } from "../controllers/auth.controller.js";

const router = Router()

router.post("/register", register) ; 
router.post("/login", login) ; 
router.post("/refresh", refresh)

// Protected route - Get logged-in user profile

router.get("/profile", authenticate, profile) ; 

router.post("/logout", logout)

export default router; 