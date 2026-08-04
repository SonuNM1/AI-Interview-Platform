import Message, { MessageDocument } from "../models/message.model.js";
import Conversation from "../models/Conversation.model.js";
import { uploadAttachment } from "./file-service.client.js";

// Creates a new message

export const createMessageService = async (
  conversationId: string,
  senderId: string,
  text: string,
  attachments: {
    fileId: string;
    url: string;
    fileName: string;
    mimeType: string;
  }[],
): Promise<MessageDocument> => {
  const message = await Message.create({
    conversationId,
    senderId,
    text,
    attachments,
  });

  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessageId: message._id,
  });
  return message;
};

// returns conversation messages

export const getConversationMessagesService = async (
  conversationId: string,
  page: number = 1,
  limit: number = 20,
): Promise<MessageDocument[]> => {
  console.log("Conversation ID:", conversationId);

  const messages = await Message.find({
    conversationId,
  })
    .sort({
      createdAt: -1,
    })
    .skip((page - 1) * limit)
    .limit(limit);

  console.log("Messages Found:", messages.length);
  console.log(messages);

  return messages;
};

// updates an existing message

export const editMessageService = async (
  messageId: string,
  text: string,
): Promise<MessageDocument> => {
  // Find the message

  const message = await Message.findById(messageId);

  if (!message) {
    throw new Error("Message not found.");
  }

  // Update the message text

  message.text = text;

  // Mark it as edited

  message.edited = true;

  // Save changes

  await message.save();

  return message;
};

// Soft delete a message

export const deleteMessageService = async (
  messageId: string,
): Promise<MessageDocument> => {
  // Find the message

  const message = await Message.findById(messageId);

  if (!message) {
    throw new Error("Message not found.");
  }

  // Replace the original text

  message.text = "This message was deleted.";

  // Mark as deleted

  message.deleted = true;

  // Once deleted, it can no longer be edited

  message.edited = false;

  // Remove all attachments

  message.attachments = [];

  await message.save();
  return message;
};

// uploads an attachment (if present) and creates a chat message

export const sendMessageService = async (
  conversationId: string,
  senderId: string,
  text: string,
  file?: Express.Multer.File,
): Promise<MessageDocument> => {
  const attachments: {
    fileId: string;
    url: string;
    fileName: string;
    mimeTyp: string;
  }[] = [];

  // Upload attachment to File Service

  if (file) {
    const uploadedFile = await uploadAttachment(file, senderId);

    attachments.push({
      fileId: uploadedFile._id,

      url: uploadedFile.url,

      fileName: uploadedFile.fileName,

      mimeType: uploadedFile.mimeType,
    });
  }

  // Save message

  return Message.create({
    conversationId,
    senderId,
    text,
    attachments,
  });
};
