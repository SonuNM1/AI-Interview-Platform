import { Schema, model, Types } from "mongoose";

// Scores the final AI generated interview report. Generated once after interview completion and reused for recruiter dashboard and analytics. 

export interface IInterviewReport {
    interviewId: Types.ObjectId;
    overallScore: number;
    communicationScore: number;
    strengths: string[];
    weaknesses: string[];
    recommendation: "Hire" | "Hold" | "Reject";
    summary: string;
    generatedAt: Date;
}

const interviewReportSchema = new Schema<IInterviewReport>(
    {
        interviewId: {
            type: Schema.Types.ObjectId,
            ref: "Interview",
            required: true,
            unique: true,
        }, 
        overallScore: {
            type: Number, 
            required: true 
        }, 
        communicationScore: {
            type: Number, 
            required: true 
        }, 
        strengths: [
            {
                type: String 
            }
        ], 
        weaknesses: [
            {
                type: String 
            }
        ], 
        recommendation: {
            type: String,
            enum: ["Hire", "Hold", "Reject"],
            required: true,
        },
        summary: {
            type: String, 
            required: true 
        }, 
        generatedAt: {
            type: Date, 
            default: Date.now 
        }
    }, 
    {
        timestamps: true 
    }
)

export default model<IInterviewReport>("InterviewReport",interviewReportSchema);