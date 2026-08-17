import mongoose, { Schema, Document } from "mongoose";

export enum MockInterviewStatus {
  READY = "READY",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export interface IMockInterview extends Document {
  userId: string;
  documentId: mongoose.Types.ObjectId;

  status: MockInterviewStatus;

  totalQuestions: number;
  currentQuestion: number;

  score?: number;

  startedAt?: Date;
  completedAt?: Date;
}

const mockInterviewSchema = new Schema(
  {
    // User who started the mock interview

    userId: {
      type: String,
      required: true,
      index: true,
    },

    // Resume/document used as the knowledge source for this interview

    documentId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    // Current state of the mock interview

    status: {
      type: String,
      enum: Object.values(MockInterviewStatus),
      default: MockInterviewStatus.READY,
    },

    // Number of questions to ask

    totalQuestions: {
      type: Number,
      required: true,
      default: 5,
      min: 1,
    },

    // Question currently being asked

    currentQuestion: {
      type: Number,
      default: 0,
    },

    // Overall score after completion

    score: {
      type: Number,
      min: 0,
      max: 10,
    },

    startedAt: Date,
    completedAt: Date,
  },
  {
    timestamps: true,
  },
);

// speeds up queries that retrieve all interviews belonging to a user 

mockInterviewSchema.index({
  userId: 1
})

export default mongoose.model<IMockInterview>(
  "MockInterview",
  mockInterviewSchema,
);