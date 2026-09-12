import {
  Check,
  MessageCircle,
  Paperclip,
  Pencil,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Socket } from "socket.io-client";

import {
  getChatAttachmentSignedUrl,
  uploadChatAttachment,
  type ChatMessage,
} from "../../services/chat.api";

import {
  createChatSocket,
  deleteChatMessage,
  editChatMessage,
  joinConversation,
  leaveConversation,
  markConversationAsRead,
  sendChatMessage,
  subscribeToMessages,
} from "../../services/chat.socket";

import { MessageInput } from "./MessageInput";
import { DeleteMessageModal } from "./DeleteMessageModal";

interface ChatWindowProps {
  conversationId: string | null;
  candidate: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    username?: string | null;
  } | null;
  candidateAvatarUrl?: string;
  currentUserId: string;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export function ChatWindow({
  conversationId,
  candidate,
  candidateAvatarUrl,
  currentUserId,
  messages,
  setMessages,
}: ChatWindowProps) {
  const socketRef = useRef<Socket | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const [deleteMessageId, setDeleteMessageId] = useState<string | null>(null);

  const [editText, setEditText] = useState("");

  const [attachmentUrls, setAttachmentUrls] = useState<Record<string, string>>(
    {},
  );

  const loadAttachmentUrl = async (fileId: string) => {
    if (attachmentUrls[fileId]) {
      return attachmentUrls[fileId];
    }

    try {
      const signedUrl = await getChatAttachmentSignedUrl(fileId);

      setAttachmentUrls((current) => ({
        ...current,
        [fileId]: signedUrl,
      }));

      return signedUrl;
    } catch (error) {
      console.error("Failed to load attachment URL:", error);
      toast.error("Unable to open attachment.");
      return null;
    }
  };

  useEffect(() => {
    const imageAttachments = messages.flatMap((message) =>
      (message.attachments ?? [])
        .filter((attachment) => attachment.mimeType.startsWith("image/"))
        .map((attachment) => attachment.fileId),
    );

    if (imageAttachments.length === 0) {
      return;
    }

    imageAttachments.forEach((fileId) => {
      if (!attachmentUrls[fileId]) {
        loadAttachmentUrl(fileId);
      }
    });
  }, [messages]);

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    let socket: Socket | null = null;
    let unsubscribeMessages: (() => void) | undefined;

    let cancelled = false;

    // Handles a message edited by either participant.
    const handleMessageEdited = (message: ChatMessage) => {
      if (message.conversationId !== conversationId) {
        return;
      }

      setMessages((current) =>
        current.map((item) => (item._id === message._id ? message : item)),
      );

      setEditingMessageId((current) =>
        current === message._id ? null : current,
      );

      setEditText("");
    };

    // Handles a message deleted by either participant.
    const handleMessageDeleted = (message: ChatMessage) => {
      if (message.conversationId !== conversationId) {
        return;
      }

      setMessages((current) =>
        current.map((item) => (item._id === message._id ? message : item)),
      );

      setEditingMessageId((current) =>
        current === message._id ? null : current,
      );

      setEditText("");
    };

    const connectChat = async () => {
      try {
        socket = await createChatSocket();

        if (cancelled) {
          socket.disconnect();
          return;
        }

        socketRef.current = socket;

        let connectionErrorShown = false;

        socket.on("connect_error", (error) => {
          console.error("Mentor chat socket connection error:", error);

          if (connectionErrorShown) {
            return;
          }

          connectionErrorShown = true;

          toast.error("Unable to connect to candidate chat.");
        });

        socket.on("connect", () => {
          joinConversation(socket!, conversationId);

          markConversationAsRead(socket!, conversationId);
        });

        unsubscribeMessages = subscribeToMessages(socket, (message) => {
          if (message.conversationId !== conversationId) {
            return;
          }

          setMessages((current) => {
            const alreadyExists = current.some(
              (item) => item._id === message._id,
            );

            if (alreadyExists) {
              return current;
            }

            return [...current, message];
          });
        });

        socket.on("message_edited", handleMessageEdited);

        socket.on("message_deleted", handleMessageDeleted);
      } catch (error) {
        console.error("Mentor chat socket error:", error);

        toast.error("Unable to connect to candidate chat.");
      }
    };

    connectChat();

    return () => {
      cancelled = true;

      if (socket) {
        leaveConversation(socket, conversationId);
      }

      unsubscribeMessages?.();

      socket?.off("message_edited", handleMessageEdited);

      socket?.off("message_deleted", handleMessageDeleted);

      socket?.disconnect();

      socketRef.current = null;
    };
  }, [conversationId, setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // Sends a text message or attachment

  const handleSend = async (content: string, file?: File) => {
    if (!socketRef.current || !conversationId) {
      return;
    }

    try {
      let attachments: ChatMessage["attachments"] = [];

      // Upload the attachment first

      if (file) {
        const uploadedFile = await uploadChatAttachment(file);

        attachments = [
          {
            fileId: uploadedFile.fileId,
            url: uploadedFile.url,
            fileName: uploadedFile.fileName,
            mimeType: uploadedFile.mimeType,
          },
        ];
      }

      sendChatMessage(socketRef.current, conversationId, content, attachments);
    } catch (error) {
      console.error("Send chat message error:", error);

      toast.error("Unable to send the message.");
    }
  };

  const handleStartEdit = (message: ChatMessage) => {
    if (message.deleted) {
      return;
    }

    setEditingMessageId(message._id);

    setEditText(message.text);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditText("");
  };

  const handleSaveEdit = () => {
    const trimmedText = editText.trim();

    if (!socketRef.current || !editingMessageId || !trimmedText) {
      return;
    }

    editChatMessage(socketRef.current, editingMessageId, trimmedText);
  };

  const handleDelete = (messageId: string) => {
    if (!socketRef.current) return;

    setDeleteMessageId(messageId);
  };

  const handleConfirmDelete = () => {
    if (!socketRef.current || !deleteMessageId) {
      return;
    }

    deleteChatMessage(socketRef.current, deleteMessageId);

    setDeleteMessageId(null);
  };

  if (!conversationId || !candidate) {
    return (
      <main className="flex min-h-[600px] flex-1 items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-600">
            <MessageCircle size={25} />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Select a conversation
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Choose a candidate to continue the conversation.
          </p>
        </div>
      </main>
    );
  }

  const candidateName =
    `${candidate.firstName ?? ""} ${candidate.lastName ?? ""}`.trim() ||
    candidate.username ||
    "Candidate";

  return (
    <main className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-slate-50">
      <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-5 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-violet-100 text-violet-700">
          {candidateAvatarUrl ? (
            <img
              src={candidateAvatarUrl}
              alt={`${candidateName} profile`}
              className="h-full w-full object-cover"
            />
          ) : (
            <User size={18} />
          )}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            {candidateName}
          </h2>

          <p className="text-xs text-slate-500">Candidate</p>
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-6">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <MessageCircle className="mx-auto text-slate-300" size={36} />

              <p className="mt-3 text-sm text-slate-500">
                Start your mentorship conversation.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === currentUserId;

            return (
              <div
                key={message._id}
                className={`group flex ${
                  isOwnMessage ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${
                    isOwnMessage
                      ? "rounded-br-md bg-violet-600 text-white"
                      : "rounded-bl-md bg-white text-slate-800 shadow-sm"
                  }`}
                >
                  {editingMessageId === message._id ? (
                    <div className="min-w-[220px]">
                      <textarea
                        value={editText}
                        onChange={(event) => setEditText(event.target.value)}
                        autoFocus
                        rows={2}
                        className="w-full resize-none rounded-lg border border-violet-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-200"
                      />

                      <div className="mt-2 flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          aria-label="Cancel edit"
                        >
                          <X size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={handleSaveEdit}
                          disabled={!editText.trim()}
                          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-violet-600 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Save edit"
                        >
                          <Check size={15} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {message.text && (
                        <p
                          className={
                            (message.attachments ?? []).length > 0 ? "mb-2": ""
                          }
                        >
                          {message.text}

                          {message.edited && !message.deleted && (
                            <span className="ml-1 text-[10px] opacity-60">
                              (edited)
                            </span>
                          )}
                        </p>
                      )}
              {(message.attachments ?? []).map((attachment) => {
  const isImage = attachment.mimeType.startsWith("image/");
  const signedUrl = attachmentUrls[attachment.fileId];

  if (isImage) {
    return (
      <button
        key={attachment.fileId}
        type="button"
        onClick={() => {
          if (signedUrl) {
            window.open(
              signedUrl,
              "_blank",
              "noopener,noreferrer",
            );
          }
        }}
        className="block cursor-pointer"
      >
        {signedUrl ? (
          <img
            src={signedUrl}
            alt={attachment.fileName}
            className="max-h-56 max-w-full rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-32 w-48 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-500">
            Loading image...
          </div>
        )}
      </button>
    );
  }

  return (
    <button
      key={attachment.fileId}
      type="button"
      onClick={async () => {
        const url = signedUrl ?? await loadAttachmentUrl(
          attachment.fileId,
        );

        if (url) {
          window.open(
            url,
            "_blank",
            "noopener,noreferrer",
          );
        }
      }}
      className="flex max-w-full items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700"
    >
      <Paperclip size={15} />
      <span className="max-w-[220px] truncate">
        {attachment.fileName}
      </span>
    </button>
  );
})}
                    </>
                  )}
                </div>

                {isOwnMessage &&
                  !message.deleted &&
                  editingMessageId !== message._id && (
                    <div className="ml-2 flex items-center gap-1 self-center opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(message)}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-violet-50 hover:text-violet-600"
                        aria-label="Edit message"
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(message._id)}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete message"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSend={handleSend} />

      <DeleteMessageModal
        open={!!deleteMessageId}
        onCancel={() => setDeleteMessageId(null)}
        onConfirm={handleConfirmDelete}
      />
    </main>
  );
}
