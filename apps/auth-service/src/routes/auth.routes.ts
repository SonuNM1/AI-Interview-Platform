import { Router } from "express";
import { forgotPassword, login, profile, refresh, register, resendOTP, resetPassword } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { logout } from "../controllers/auth.controller.js";
import { verifyEmailController } from "../controllers/auth.controller.js";
import { validateRequest } from "../middlewares/validate-request.js";
import { verifyEmailSchema } from "../validators/verify-email.schema.js";
import { deleteUserController } from "../controllers/auth.controller.js";

const router = Router()

router.post("/register", register) ; 
router.post("/login", login) ; 
router.post("/refresh", refresh)

// Protected route - Get logged-in user profile

router.get("/profile", authenticate, profile) ; 

router.post("/logout", logout)

router.post("/verify-email", validateRequest(verifyEmailSchema),verifyEmailController);

router.delete(
    "/delete-user/:id",
    deleteUserController
);

router.post("/resend-otp", resendOTP)

// forgot password 

router.post("/forgot-password", forgotPassword)

// reset password 

router.post("/reset-password", resetPassword)

export default router; 