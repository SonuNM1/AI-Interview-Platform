import mongoose, {Schema, Document} from "mongoose";

// message document 

export interface MessageDocument extends Document {
    conversationId: mongoose.Types.ObjectId;
    senderId: string;
    text: string;
    attachments: {
        fileId: string; 
        url: string; 
        fileName: string; 
        mimeType: string 
    }[];
    readBy: string[];
    edited: boolean;
    deleted: boolean;
}

const messageSchema = new Schema<MessageDocument>(
    {
        conversationId: {
            type: Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
            index: true
        },
        senderId: {
            type: String,
            required: true,
            index: true
        },
        text: {
            type: String,
            default: ""
        },

        attachments: [
            {
                fileId: {
                    type: String, 
                    required: true
                },
                url: {
                    type: String, 
                    required: true
                },
                fileName: {
                    type: String, 
                    required: true, 
                }, 
                mimeType: {
                    type: String, 
                    required: true 
                }
            }
        ],
        readBy: {
            type: [String],
            default: []
        },
         edited: {
            type: Boolean,
            default: false
        },
        deleted: {
            type: Boolean,
            default: false
        }
        },
    {
        timestamps: true
    }
);

// speed up loading chat history 

messageSchema.index({
    conversationId: 1,
    createdAt: -1
});

export default mongoose.model<MessageDocument>(
    "Message",
    messageSchema
);