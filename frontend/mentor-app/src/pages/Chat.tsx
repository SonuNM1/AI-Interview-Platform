import {
  MessageCircle,
  Search,
  Send,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import {
  getConversationMessages,
  getConversations,
  type ChatMessage,
  type Conversation,
} from "../services/chat.api";

import {
  createChatSocket,
  SOCKET_EVENTS,
} from "../services/chat.socket";

export default function Chats() {
  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [messageText, setMessageText] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const socketRef = useRef<
    Awaited<ReturnType<typeof createChatSocket>> | null
  >(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getConversations();

        setConversations(
          data.filter(
            (conversation) =>
              conversation.type === "MENTORSHIP",
          ),
        );
      } catch (error) {
        console.error(
          "Failed to load mentor chats:",
          error,
        );

        toast.error(
          "Unable to load your conversations.",
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  useEffect(() => {
    const connect = async () => {
      try {
        const socket =
          await createChatSocket();

        socketRef.current = socket;

        socket.on(
          SOCKET_EVENTS.RECEIVE_MESSAGE,
          (message: ChatMessage) => {
            setMessages((current) => {
              if (
                current.some(
                  (item) =>
                    item._id === message._id,
                )
              ) {
                return current;
              }

              return [...current, message];
            });
          },
        );
      } catch (error) {
        console.error(
          "Mentor chat socket error:",
          error,
        );
      }
    };

    void connect();

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!selectedConversation) {
      return;
    }

    const loadMessages = async () => {
      try {
        const data =
          await getConversationMessages(
            selectedConversation._id,
          );

        setMessages(data);

        socketRef.current?.emit(
          SOCKET_EVENTS.JOIN_CONVERSATION,
          selectedConversation._id,
        );
      } catch (error) {
        console.error(
          "Failed to load chat messages:",
          error,
        );
      }
    };

    void loadMessages();
  }, [selectedConversation]);

  const sendMessage = () => {
    const text = messageText.trim();

    if (!text || !selectedConversation) {
      return;
    }

    socketRef.current?.emit(
      SOCKET_EVENTS.SEND_MESSAGE,
      {
        conversationId:
          selectedConversation._id,
        text,
        attachments: [],
      },
    );

    setMessageText("");
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <p className="text-sm font-medium text-violet-600">
          Mentorship
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Chats
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Chat with candidates who have subscribed to
          your mentorship.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid min-h-[650px] lg:grid-cols-[320px_1fr]">
          {/* Candidate list */}
          <aside className="border-b border-slate-200 lg:border-b-0 lg:border-r">
            <div className="border-b border-slate-100 p-5">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  placeholder="Search candidates..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex h-[560px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex h-[560px] items-center justify-center px-6 text-center">
                <div>
                  <MessageCircle className="mx-auto text-violet-500" />

                  <p className="mt-3 text-sm font-semibold text-slate-800">
                    No mentorship chats yet
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    New candidates will appear here after
                    purchasing your mentorship.
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-h-[560px] overflow-y-auto">
                {conversations.map(
                  (conversation) => (
                    <button
                      key={conversation._id}
                      type="button"
                      onClick={() =>
                        setSelectedConversation(
                          conversation,
                        )
                      }
                      className={[
                        "flex w-full cursor-pointer items-center gap-3 border-b border-slate-100 px-5 py-4 text-left transition",
                        selectedConversation?._id ===
                        conversation._id
                          ? "bg-violet-50"
                          : "hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-100 font-semibold text-violet-700">
                        C
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Candidate
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Mentorship subscriber
                        </p>
                      </div>
                    </button>
                  ),
                )}
              </div>
            )}
          </aside>

          {/* Chat */}
          <main className="flex min-h-[650px] flex-col">
            {!selectedConversation ? (
              <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-violet-50/50 via-white to-indigo-50/50 text-center">
                <div>
                  <MessageCircle className="mx-auto text-violet-500" />

                  <h2 className="mt-4 text-xl font-bold text-slate-900">
                    Your mentorship chats
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Select a candidate to start chatting.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <header className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-100 font-semibold text-violet-700">
                    C
                  </div>

                  <div>
                    <p className="font-semibold text-slate-900">
                      Candidate
                    </p>

                    <p className="text-xs text-emerald-600">
                      Mentorship active
                    </p>
                  </div>
                </header>

                <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/50 p-6">
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${
                        message.senderId ===
                        selectedConversation.participants[0]
                          ? "justify-start"
                          : "justify-end"
                      }`}
                    >
                      <div className="max-w-[75%] rounded-2xl bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm ring-1 ring-slate-100">
                        {message.deleted
                          ? "This message was deleted."
                          : message.text}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 p-4">
                  <div className="flex items-end gap-3">
                    <textarea
                      value={messageText}
                      onChange={(event) =>
                        setMessageText(
                          event.target.value,
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" &&
                          !event.shiftKey
                        ) {
                          event.preventDefault();
                          sendMessage();
                        }
                      }}
                      rows={1}
                      placeholder="Type a message..."
                      className="min-h-11 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
                    />

                    <button
                      type="button"
                      onClick={sendMessage}
                      className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-700"
                    >
                      <Send size={17} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}