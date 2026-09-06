import mongoose, { Schema, Document } from "mongoose";

/**
 * Conversation types.
 *
 * Existing conversations can continue using DIRECT.
 * Mentor marketplace conversations use MENTORSHIP.
 */
export enum ConversationType {
  DIRECT = "DIRECT",
  MENTORSHIP = "MENTORSHIP",
}

// Conversation document
export interface ConversationDocument extends Document {
  participants: string[];
  isGroup: boolean;
  title?: string;
  type: ConversationType;
  lastMessageId?: mongoose.Types.ObjectId;
}

const conversationSchema = new Schema<ConversationDocument>(
  {
    participants: {
      type: [String],
      required: true,
    },

    isGroup: {
      type: Boolean,
      default: false,
    },

    title: {
      type: String,
      trim: true,
    },

    /**
     * Existing conversations are treated as DIRECT.
     *
     * This default keeps existing records compatible.
     */
    type: {
      type: String,
      enum: Object.values(ConversationType),
      default: ConversationType.DIRECT,
      index: true,
    },

    lastMessageId: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate 1-to-1 conversations
conversationSchema.index({
  participants: 1,
  isGroup: 1,
});

export default mongoose.model<ConversationDocument>(
  "Conversation",
  conversationSchema
);