import { z } from "zod";

// validate verify email request 

export const verifyEmailSchema = z.object({
    userId: z.string().min(1),
    otp: z.string().length(6)
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;