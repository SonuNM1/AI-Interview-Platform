import { Router } from "express";
import { forgotPassword, googleLogin, login, profile, refresh, register, requestAccountDeletionController, resendOTP, resetPassword, verifyAccountDeletionController } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { logout } from "../controllers/auth.controller.js";
import { verifyEmailController } from "../controllers/auth.controller.js";
import { validateRequest } from "../middlewares/validate-request.js";
import { verifyEmailSchema } from "../validators/verify-email.schema.js";

const router: Router = Router()

router.post("/register", register) ; 
router.post("/login", login) ; 
router.post("/refresh", refresh)

// Protected route - Get logged-in user profile

router.get("/profile", authenticate, profile) ; 

router.post("/logout", logout)

router.post("/verify-email", validateRequest(verifyEmailSchema),verifyEmailController);

router.post("/resend-otp", resendOTP)

// forgot password 

router.post("/forgot-password", forgotPassword)

// reset password 

router.post("/reset-password", resetPassword)

// google login 

router.post("/google", googleLogin);

router.post("/delete-account/request", authenticate, requestAccountDeletionController) ; 

router.post("/delete-account/verify", authenticate, verifyAccountDeletionController)

export default router; 