import {z} from "zod" ; 
import { InterviewDifficulty, InterviewType } from "../models/interview.model.js";

export const createInterviewSchema = z.object({
    title: z.string().min(3), 
    description: z.string().optional(), 
    role: z.string().min(2), 
    skills: z.array(z.string()).min(1), 
    duration: z.number().min(10), 
    totalQuestions: z.number().min(5).max(5).optional(),
    scheduledAt: z.coerce.date(),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]), 
    experience: z.number().min(0).optional(),
    type: z.enum([
        "TECHNICAL", 
        "HR", 
        "SYSTEM_DESIGN", 
        "DSA"
    ]),
    candidateId: z.string().min(1)
})

// Only recruiter-editable fields are allowed. System-managed fields (status, score, feedback, timestamps, etc.) cannot be updated manually 

export const updateInterviewSchema = z.object({
    title: z.string().min(3).max(100).optional(), 

    description: z.string().min(10).max(1000).optional(), 

    role: z.string().min(2).max(100).optional(), 

    skills: z.array(z.string()).min(1).optional(), 

    duration: z.number().min(1).max(180).optional(), 

    scheduledAt: z.coerce.date().optional(),

    difficulty: z.nativeEnum(InterviewDifficulty).optional(), 

    type: z.nativeEnum(InterviewType).optional()
}).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required for update"
})