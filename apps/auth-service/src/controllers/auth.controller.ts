import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import {
  deleteUser,
  getProfile,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resetPasswordService,
} from "../services/auth.service.js";
import {
  forgotPasswordSchema,
  googleLoginSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resendOTPSchema,
  resetPasswordSchema,
} from "../validators/auth.validator.js";
import { JwtPayload } from "jsonwebtoken";
import { verifyEmail } from "../services/auth.service.js";
import { resendOTPService } from "../services/auth.service.js";
import { forgotPasswordService } from "../services/auth.service.js";
import { loginWithGoogle } from "../services/google-auth.service.js";
import { requestAccountDeletion, verifyAccountDeletion } from "../services/auth.service.js";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const user = await registerUser(validatedData);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    next(error) ; // forward error to global error handler 
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const result = await loginUser(validatedData);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    next(error) ; 
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // validate request body

    const validatedData = refreshTokenSchema.parse(req.body);

    // Generate a new access token

    const result = await refreshAccessToken(validatedData);

    res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      data: result,
    });
  } catch (error) {
    console.error("Refresh controller error: ", error);

    next(error) ;
  }
};

// Get logged-in user's profile

export const profile = async (req: Request, res: Response) => {
  try {
    // read logged-in user from middlewrae

    const user = req.user as JwtPayload;

    // fetch profile

    const profile = await getProfile(user.id);

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: profile,
    });
  } catch (error) {
    console.error("Profile error: ", error);

    return res.status(500).json({
      succes: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    await logoutUser(req.body);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

// Verify email OTP 

export const verifyEmailController = async (
  req: Request,
  res: Response, 
  next: NextFunction 
) => {
  try {
    const result = await verifyEmail(req.body) ; 

    res.status(200).json({
      success: true, 
      message: "Email verified successfully", 
      data: result 
    })
  } catch (error) {
    next(error) ; // forwarding error to the global error handler 
  }
}

// Resend OTP 

export const resendOTP = async (
  req: Request,
  res: Response, 
  next: NextFunction 
) => {
  try {
    const data = resendOTPSchema.parse(req.body) ; 

    const result = await resendOTPService(data) ; 

    res.status(200).json({
      success: true, 
      ...result 
    })
  } catch (error) {
    next(error) ; 
  }
}

// Forgot Password 

export const forgotPassword = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const data = forgotPasswordSchema.parse(req.body) ; // validate req body 

    // sending password reset otp 

    const result = await forgotPasswordService(data) ; 

    res.status(200).json({
      success: true, 
      ...result, 
    })
  } catch (error) {
    next(error) ;  
  }
}

// Reset password 

export const resetPassword = async (
  req: Request, 
  res: Response, 
  next: NextFunction 
) => {
  try {
    
    // validate request 

    const data = resetPasswordSchema.parse(req.body) ; 

    // resetting the password 

    const result = await resetPasswordService(data) ; 

    res.status(200).json({
      success: true, 
      ...result 
    })

  } catch (error) {
    next(error) ; 
  }
}

// social login - google 

export const googleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = googleLoginSchema.parse(req.body) ; 

    const result = await loginWithGoogle(
      validatedData.idToken, 
      validatedData.role 
    )

    return res.status(200).json({
      success: true, 
      message: "Google login successful", 
      data: result 
    })
  } catch (error) {
    next(error);
  }
};

/* Sends an OTP required to delete the authenticated user's account */

export const requestAccountDeletionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as JwtPayload;

    const result = await requestAccountDeletion(
      user.id,
      user.email,
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/* Verifies the account deletion OTP and soft-deletes the account */

export const verifyAccountDeletionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as JwtPayload;

    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    const result = await verifyAccountDeletion(
      user.id,
      otp,
    );

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};