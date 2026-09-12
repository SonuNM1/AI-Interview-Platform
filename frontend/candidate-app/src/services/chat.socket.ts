import { io, type Socket } from "socket.io-client";
import type { ChatMessage } from "./chat.api";

const CHAT_SOCKET_URL =
  import.meta.env.VITE_CHAT_SOCKET_URL ||
  "http://localhost:5005";

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

// creates an authenticated Socket.IO connection 

export const createChatSocket = async (): Promise<Socket> => {

  let token = window.__AUTH_BRIDGE__?.getAccessToken();

  // refresh the access token before opening the socket 

  if (window.__AUTH_BRIDGE__?.refreshAccessToken) {
    try {
      token = await window.__AUTH_BRIDGE__.refreshAccessToken();
    } catch (error) {
      console.error("Socket token refresh failed:", error);
    }
  }

  return io(CHAT_SOCKET_URL, {
    auth: {
      token,
    },

    // Don't continuously reconnect when authentication fails.

    reconnection: true,
    reconnectionAttempts: 3,
    reconnectionDelay: 1000,
  });
};

export const joinConversation = (
  socket: Socket,
  conversationId: string,
) => {
  socket.emit(SOCKET_EVENTS.JOIN_CONVERSATION, {
    conversationId
  });
};

export const leaveConversation = (
  socket: Socket,
  conversationId: string,
) => {
  socket.emit(SOCKET_EVENTS.LEAVE_CONVERSATION, {
    conversationId
  });
};

// sends a text message or a message containing uploaded attachments 

export const sendChatMessage = (
  socket: Socket,
  conversationId: string,
  content: string,
  attachments: {
    fileId: string ; 
    url: string ; 
    fileName: string ; 
    mimeType: string 
  }[] = []
) => {
  socket.emit(SOCKET_EVENTS.SEND_MESSAGE, {
    conversationId,
    text: content,
    attachments,
  });
};

// receives newly created messages 

export const subscribeToMessages = (
  socket: Socket,
  callback: (message: ChatMessage) => void,
) => {
  socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, callback);

  return () => {
    socket.off(SOCKET_EVENTS.RECEIVE_MESSAGE, callback);
  };
};

// marks messages in the current conversation as read 

export const markConversationAsRead = (
  socket: Socket, 
  conversationId: string 
) => {
  socket.emit(SOCKET_EVENTS.MESSAGE_READ, {
    conversationId
  })
}

// sends an edit request through Socket.IO

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

// Sends a delete request through Socket.IO

export const deleteChatMessage = (
  socket: Socket,
  messageId: string,
) => {
  socket.emit(SOCKET_EVENTS.DELETE_MESSAGE, {
    messageId,
  });
};

export {SOCKET_EVENTS} ; 