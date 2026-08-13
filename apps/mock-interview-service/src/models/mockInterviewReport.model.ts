import mongoose, { Schema, Document } from "mongoose";

export interface IMockInterviewReport extends Document {
  mockInterviewId: mongoose.Types.ObjectId;

  overallScore: number;

  strengths: string[];

  weaknesses: string[];

  summary: string;

  recommendation: "Strong" | "Good" | "Needs Improvement";

  generatedAt: Date;
}

const mockInterviewReportSchema = new Schema(
  {
    mockInterviewId: {
      type: Schema.Types.ObjectId,
      ref: "MockInterview",
      required: true,
      unique: true,
      index: true,
    },

    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    summary: {
      type: String,
      required: true,
    },

    recommendation: {
      type: String,
      enum: ["Strong", "Good", "Needs Improvement"],
      required: true,
    },

    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IMockInterviewReport>(
  "MockInterviewReport",
  mockInterviewReportSchema,
);