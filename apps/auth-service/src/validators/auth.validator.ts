
import {z} from "zod" ; 

export const registerSchema = z.object({
    email: z.email("Invalid email address"), 

    password: z.string().min(4, "Password must be at least 4 characters"),

    role: z.enum(["CANDIDATE", "RECRUITER", "MENTOR"], {
        error: "Please select a valid role"
    })
}) ; 

export const googleLoginSchema = z.object({
    idToken: z.string().min(1, "Google ID token is required"), 

    role: z.enum(["CANDIDATE", "RECRUITER", "MENTOR"], {
        error: "Please select a valid role"
    })
})

export const loginSchema = z.object({
    email: z.email("Invalid email"), 
    password: z.string().min(1, "Password is required")
})

// validating the refresh token received from the client

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, "Refresh token is required")
})

export const resendOTPSchema = z.object({
    email: z.email()
})

export const forgotPasswordSchema = z.object({
    email: z.email()
})

const passwordSchema = z.string().min(4, "Password must be at least 6 characters") ; 

// reset password 

export const resetPasswordSchema = z.object({
    email: z.email(), 

    otp: z.string().length(6, "OTP must be 6 digits"), 

    newPassword: passwordSchema
})


type RegisterInput = z.infer<typeof registerSchema> ; 
type LoginInput = z.infer<typeof loginSchema> ;
type RefreshTokenInput = z.infer<typeof refreshTokenSchema>
type ResendOTPInput = z.infer<typeof resendOTPSchema> ; 
type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>

type GoogleLoginInput = z.infer<typeof googleLoginSchema> ; 

export type {RegisterInput, LoginInput, RefreshTokenInput, ResendOTPInput, ForgotPasswordInput, ResetPasswordSchema, GoogleLoginInput} ; 