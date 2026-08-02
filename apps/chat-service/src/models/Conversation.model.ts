import mongoose, {Schema, Document} from "mongoose";

// Conversation document 

export interface ConversationDocument extends Document {
    participants: string[] ; 
    isGroup: boolean ; 
    title?: string; 
    lastMessageId?: mongoose.Types.ObjectId 
}

const conversationSchema = new Schema<ConversationDocument>(
    {
        participants: {
            type: [String],
            required: true
        },

        isGroup: {
            type: Boolean,
            default: false
        },

        title: {
            type: String,
            trim: true
        },
        lastMessageId: {
            type: Schema.Types.ObjectId,
            ref: "Message"
        }
    },
    {
        timestamps: true 
    }
)

// Prevent duplicate 1-to-1 conversations 

conversationSchema.index({
    participants: 1, 
    isGroup: 1
}) ; 

export default mongoose.model<ConversationDocument>(
    "Conversation", conversationSchema
)