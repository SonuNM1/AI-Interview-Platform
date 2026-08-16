import mongoose, { Schema, Document } from "mongoose";

export interface IMockInterviewQuestion extends Document {
  mockInterviewId: mongoose.Types.ObjectId;
  questionNumber: number;
  question: string;
  candidateAnswer?: string;
  answerTranscript?: string;
  score?: number;
  feedback?: string;
  askedAt: Date;
  answeredAt?: Date;
  duration?: number;
  answerProcessing?: boolean;
}

const mockInterviewQuestionSchema = new Schema(
  {
    // Parent mock interview

    mockInterviewId: {
      type: Schema.Types.ObjectId,
      ref: "MockInterview",
      required: true,
      index: true,
    },

    // Position of this question in the interview

    questionNumber: {
      type: Number,
      required: true,
    },

    // AI-generated question based on the user's resume

    question: {
      type: String,
      required: true,
      trim: true,
    },

    // Text answer submitted by the user

    candidateAnswer: {
      type: String,
      trim: true,
    },

    // Transcript when the user answers through voice

    answerTranscript: {
      type: String,
      trim: true,
    },

    // AI evaluation score

    score: {
      type: Number,
      min: 0,
      max: 10,
    },

    // AI feedback for this answer

    feedback: {
      type: String,
      trim: true,
    },

    // When AI asked the question

    askedAt: {
      type: Date,
      default: Date.now,
    },
    answeredAt: Date,

    // prevents two simultaneous requests from processing the same answer

    answerProcessing: {
      type: Boolean, 
      default: false 
    },

    duration: Number,
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate question numbers inside one mock interview.

mockInterviewQuestionSchema.index(
  {
    mockInterviewId: 1,
    questionNumber: 1,
  },
  {
    unique: true,
  },
);

export default mongoose.model<IMockInterviewQuestion>(
  "MockInterviewQuestion",
  mockInterviewQuestionSchema,
);