import mongoose, { Document, Schema } from "mongoose";

export enum QuestionType {
  OPEN_ENDED = "OPEN_ENDED",
  TECHNICAL = "TECHNICAL",
  CODING = "CODING",
  HR = "HR",
  SYSTEM_DESIGN = "SYSTEM_DESIGN",
}

export enum GeneratedBy {
  AI = "AI",
  SYSTEM = "SYSTEM",
}

export interface IInterviewQuestion extends Document {
  interviewId: mongoose.Types.ObjectId;

  questionNumber: number;

  question: string;

  type: QuestionType;

  generatedBy: GeneratedBy;

  candidateAnswer?: string;

  answerTranscript?: string;

  score?: number;

  feedback?: string;

  askedAt: Date;

  answeredAt?: Date;

  duration?: number; 
}

const interviewQuestionSchema = new Schema<IInterviewQuestion>(
  {
    interviewId: {
      type: Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
    },

    questionNumber: {
      type: Number,
      required: true,
    },

    question: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: Object.values(QuestionType),
      default: QuestionType.OPEN_ENDED,
    },

    generatedBy: {
      type: String,
      enum: Object.values(GeneratedBy),
      default: GeneratedBy.AI,
    },

    candidateAnswer: {
      type: String,
      trim: true,
    },

    answerTranscript: {
      type: String,
      trim: true,
    },

    score: {
      type: Number,
      min: 0,
      max: 10,
    },

    duration: {
        type: Number 
    },

    feedback: {
      type: String,
      trim: true,
    },

    askedAt: {
      type: Date,
      default: Date.now,
    },

    answeredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const InterviewQuestion = mongoose.model<IInterviewQuestion>(
  "InterviewQuestion",
  interviewQuestionSchema
);

export default InterviewQuestion;