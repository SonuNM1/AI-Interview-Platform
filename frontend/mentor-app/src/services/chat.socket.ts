import { io, type Socket } from "socket.io-client";
import type { ChatMessage } from "./chat.api";

const CHAT_SOCKET_URL =
  import.meta.env.VITE_CHAT_SOCKET_URL || "http://localhost:5005";

const SOCKET_EVENTS = {
  JOIN_CONVERSATION: "join_conversation",
  LEAVE_CONVERSATION: "leave_conversation",
  SEND_MESSAGE: "send_message",
  RECEIVE_MESSAGE: "receive_message",
  MESSAGE_READ: "message_read",
  EDIT_MESSAGE: "edit_message",
  MESSAGE_EDITED: "message_edited",
  DELETE_MESSAGE: "delete_message",
  MESSAGE_DELETED: "message_deleted",
} as const;

// Creates an authenticated Socket.IO connection for the mentor

export const createChatSocket = async (): Promise<Socket> => {
  const authBridge = window.__AUTH_BRIDGE__ as
    | {
        getAccessToken?: () => Promise<string | null> | string | null;
      }
    | undefined;

  const token = await authBridge?.getAccessToken?.();

  if (!token) {
    throw new Error("Unable to connect to chat: authentication token missing.");
  }

  return io(CHAT_SOCKET_URL, {
    transports: ["websocket"],
    auth: {
      token,
    },
  });
};

export const joinConversation = (socket: Socket, conversationId: string) => {
  socket.emit(SOCKET_EVENTS.JOIN_CONVERSATION, {
    conversationId,
  });
};

export const leaveConversation = (socket: Socket, conversationId: string) => {
  socket.emit(SOCKET_EVENTS.LEAVE_CONVERSATION, {
    conversationId,
  });
};

// sends a text message or a message containing uploaded attachments

export const sendChatMessage = (
  socket: Socket,
  conversationId: string,
  content: string,
  attachments: {
    fileId: string;
    url: string;
    fileName: string;
    mimeType: string;
  }[] = [],
) => {
  socket.emit(SOCKET_EVENTS.SEND_MESSAGE, {
    conversationId,
    text: content,
    attachments,
  });
};

export const subscribeToMessages = (
  socket: Socket,
  callback: (message: ChatMessage) => void,
) => {
  socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, callback);

  return () => {
    socket.off(SOCKET_EVENTS.RECEIVE_MESSAGE, callback);
  };
};

// marks the current conversation as read 

export const markConversationAsRead = (
  socket: Socket,
  conversationId: string,
) => {
  socket.emit(SOCKET_EVENTS.MESSAGE_READ, {
    conversationId,
  });
};

// sends an edit request 

export const editChatMessage = (
  socket: Socket,
  messageId: string,
  text: string,
) => {
  socket.emit(SOCKET_EVENTS.EDIT_MESSAGE, {
    messageId,
    text,
  });
};

// sends a delete request 

export const deleteChatMessage = (
  socket: Socket,
  messageId: string,
) => {
  socket.emit(SOCKET_EVENTS.DELETE_MESSAGE, {
    messageId,
  });
};


export { SOCKET_EVENTS };
