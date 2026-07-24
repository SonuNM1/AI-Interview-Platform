
import {z} from "zod" ; 

export const registerSchema = z.object({
    email: z.email("Invalid email address"), 

    password: z.string().min(8, "Password must be at least 8 characters"), 

    firstName: z.string().min(2, "First name is requireed"), 

    lastName: z.string().optional(), 

    phone: z.string().optional()
})

export const loginSchema = z.object({
    email: z.email("Invalid email"), 
    password: z.string().min(1, "Password is required")
})

// validating the refresh token received from the client

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, "Refresh token is required")
})

type RegisterInput = z.infer<typeof registerSchema> ; 
type LoginInput = z.infer<typeof loginSchema> ;
type RefreshTokenInput = z.infer<typeof refreshTokenSchema>

export type {RegisterInput, LoginInput, RefreshTokenInput} ; 