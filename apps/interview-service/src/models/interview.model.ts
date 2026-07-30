import mongoose, { Schema, Document } from "mongoose";

export enum InterviewStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  SCHEDULED = "SCHEDULED",
  PAUSED = "PAUSED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum InterviewDifficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

export enum InterviewType {
  TECHNICAL = "TECHNICAL",
  HR = "HR",
  SYSTEM_DESIGN = "SYSTEM_DESIGN",
  DSA = "DSA",
}

export interface IInterview extends Document {
  title: string;
  description?: string;
  role: string;
  skills: string[];
  duration: number;
  totalQuestions: number ;
  difficulty: InterviewDifficulty;
  type: InterviewType;
  status: InterviewStatus;
  createdBy: string;
  candidateId: string;
  score?: number;
  feedback?: string;
  startedAt?: Date;
  completedAt?: Date;
  experience: number;

  accessToken?: string;
  expiresAt?: Date;
}

const interviewSchema = new Schema<IInterview>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    skills: {
      type: [String],
      required: true,
    },

    duration: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number, 
      required: true, 
      default: 5, 
      min: 1
    },
    difficulty: {
      type: String,
      enum: Object.values(InterviewDifficulty),
      default: InterviewDifficulty.MEDIUM,
    },

    type: {
      type: String,
      enum: Object.values(InterviewType),
      default: InterviewType.TECHNICAL,
    },
    experience: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(InterviewStatus),
      default: InterviewStatus.DRAFT,
    },
    createdBy: {
      type: String,
      required: true,
    },
    candidateId: String,
    score: Number,
    feedback: String,
    startedAt: Date,
    completedAt: Date,

    // secure token used to generate a public interview link. Candidates access the interview using this token instead of the MongoDB ObjectId

    accessToken: {
      type: String,
      unique: true,
      sparse: true,
    },

    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IInterview>("Interview", interviewSchema);
