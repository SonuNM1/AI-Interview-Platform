// Centralized socket event names -  Prevents typo-related bugs and keeps events consistent.

export const SOCKET_EVENTS = {
  CONNECTION: "connection",
  DISCONNECT: "disconnect",

  JOIN_CONVERSATION: "join_conversation",
  LEAVE_CONVERSATION: "leave_conversation",

  SEND_MESSAGE: "send_message",
  RECEIVE_MESSAGE: "receive_message",

  EDIT_MESSAGE: "edit_message",
  MESSAGE_EDITED: "message_edited",

  DELETE_MESSAGE: "delete_message",
  MESSAGE_DELETED: "message_deleted",

  TYPING: "typing",
  STOP_TYPING: "stop_typing",

  MESSAGE_READ: "message_read",

  USER_ONLINE: "user_online",

  USER_OFFLINE: "user_offline",

  LAST_SEEN: "last_seen",

  USER_CONNECTED: "user_connected",
  USER_DISCONNECTED: "user_disconnected",

  GET_PRESENCE: "get_presence",
  PRESENCE: "presence",
} as const;
