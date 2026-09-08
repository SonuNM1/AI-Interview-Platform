import { io, type Socket } from "socket.io-client";

const CHAT_SOCKET_URL =
  import.meta.env.VITE_CHAT_SOCKET_URL ||
  "http://localhost:5005";

const SOCKET_EVENTS = {
  JOIN_CONVERSATION: "join_conversation",
  SEND_MESSAGE: "send_message",
  RECEIVE_MESSAGE: "receive_message",
} as const;

// Creates an authenticated Socket.IO connection for the mentor

export const createChatSocket = async (): Promise<Socket> => {
  const authBridge = window.__AUTH_BRIDGE__ as
    | {
        getAccessToken?: () =>
          | Promise<string | null>
          | string
          | null;
      }
    | undefined;

  const token =
    await authBridge?.getAccessToken?.();

  if (!token) {
    throw new Error(
      "Unable to connect to chat: authentication token missing.",
    );
  }

  return io(CHAT_SOCKET_URL, {
    transports: ["websocket"],
    auth: {
      token,
    },
  });
};

export { SOCKET_EVENTS };