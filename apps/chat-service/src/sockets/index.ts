import { Server, Socket } from "socket.io";

import { SOCKET_EVENTS } from "../constants/socket-events.js";
import {
  createMessageService,
  editMessageService,
} from "../services/message.service.js";
import { lastSeenUsers, onlineUsers } from "../utils/presence.js";
import { streamAIResponse } from "../services/ai-service.client.js";

// register all socket events

export const registerSocketEvents = (io: Server) => {
  io.on(SOCKET_EVENTS.CONNECTION, (socket: Socket) => {
    console.log(`✅ User Connected : ${socket.id}`);

    // join a conversation room

    socket.on(SOCKET_EVENTS.JOIN_CONVERSATION, (conversationId: string) => {
      // Join the requested conversation room

      socket.join(conversationId);

      console.log(`${socket.id} joined ${conversationId}`);
    });

    // marks a user online

    socket.on(SOCKET_EVENTS.USER_CONNECTED, ({ userId }) => {
      // save online user

      onlineUsers.set(userId, socket.id);

      // user is online again

      lastSeenUsers.delete(userId);

      // notify everyone

      io.emit(SOCKET_EVENTS.USER_CONNECTED, { userId });
    });

    // returns presence of a user

    socket.on(SOCKET_EVENTS.GET_PRESENCE, ({ userId }) => {
      socket.emit(SOCKET_EVENTS.PRESENCE, {
        userId,
        online: onlineUsers.has(userId),
        lastSeen: lastSeenUsers.get(userId) ?? null,
      });
    });

    // handle sending a message

    socket.on(SOCKET_EVENTS.SEND_MESSAGE, async (payload) => {
      const { conversationId, senderId, text, attachments } = payload;

      // Save message in MongoDB
      const message = await createMessageService(
        conversationId,
        senderId,
        text,
        attachments,
      );

      // Broadcast message to everyone in the room
      io.to(conversationId).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, message);
    });

    // handle socket disconnect

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      let disconnectedUserId: string | null = null;

      // Find the disconnected user

      for (const [userId, socketId] of onlineUsers) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;

          onlineUsers.delete(userId);

          lastSeenUsers.set(userId, new Date());

          break;
        }
      }

      if (disconnectedUserId) {
        io.emit(SOCKET_EVENTS.USER_DISCONNECTED, {
          userId: disconnectedUserId,
        });
      }

      console.log(`❌ User Disconnected : ${socket.id}`);
    });

    // broadcast typing event to everyon else in the conversation

    socket.on(SOCKET_EVENTS.TYPING, ({ conversationId, userId }) => {
      socket.to(conversationId).emit(SOCKET_EVENTS.TYPING, {
        conversationId,
        userId,
      });
    });

    // Broadcast stop typing event

    socket.on(SOCKET_EVENTS.STOP_TYPING, ({ conversationId, userId }) => {
      socket.to(conversationId).emit(SOCKET_EVENTS.STOP_TYPING, {
        conversationId,
        userId,
      });
    });

    // generates an AI mentor response and streams it to the conversation

    socket.on(
      SOCKET_EVENTS.AI_MENTOR_MESSAGE,
      async ({ conversationId, message }) => {

        console.log("✅ AI_MENTOR_MESSAGE received");

        try {
          await streamAIResponse(
            conversationId,

            message,

            // Notify clients that AI has started replying.

            () => {
              io.to(conversationId).emit(SOCKET_EVENTS.AI_STREAM_START);
            },

            // Forward every generated token immediately.

            (token) => {
              io.to(conversationId).emit(SOCKET_EVENTS.AI_STREAM_TOKEN, {
                conversationId,
                token,
              });
            },

            // Notify clients that streaming has finished.

            () => {
              io.to(conversationId).emit(SOCKET_EVENTS.AI_STREAM_END, {
                conversationId,
              });
            },
          );
        } catch (error) {
          console.error("AI streaming error:", error);
        }
      },
    );

    // handles editing a message

    socket.on(SOCKET_EVENTS.EDIT_MESSAGE, async ({ messageId, text }) => {
      // Update the message

      const message = await editMessageService(messageId, text);

      // Notify everyone in the conversation

      io.to(message.conversationId.toString()).emit(
        SOCKET_EVENTS.MESSAGE_EDITED,
        message,
      );
    });
  });
};
