import {
  MessageCircle,
  Search,
  Send,
  Sparkles,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import { toast } from "sonner";

import {
  createMentorshipConversation,
  getConversationMessages,
  getConversations,
  type ChatMessage,
  type Conversation,
} from "../../services/chat.api";

import {
  createChatSocket,
  SOCKET_EVENTS,
} from "../../services/chat.socket";

import {
  getMentor,
  type Mentor,
} from "../../services/mentorship.api";

export function MentorChat() {

  const { mentorId } = useParams<{
    mentorId?: string;
  }>();

  const navigate = useNavigate();

  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [messageText, setMessageText] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [mentor, setMentor] =
    useState<Mentor | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const socketRef = useRef<
    Awaited<ReturnType<typeof createChatSocket>> | null
  >(null);

  // load all candidate conversations. The Chat Service already returns conversations belonging to the authenticated user 

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const data = await getConversations();

        const mentorshipConversations =
          data.filter(
            (conversation) =>
              conversation.type === "MENTORSHIP",
          );

        setConversations(
          mentorshipConversations,
        );
      } catch (error) {
        console.error(
          "Failed to load conversations:",
          error,
        );

        toast.error(
          "Unable to load your mentor conversations.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadConversations();
  }, []);

  // if the user reached directly on the chat page, find the existing conversation for that mentor

  useEffect(() => {
    if (!mentorId) {
      return;
    }

    let cancelled = false;

    const openMentorConversation = async () => {
      try {
        const mentorData =
          await getMentor(mentorId);

        if (cancelled) {
          return;
        }

        setMentor(mentorData);

        let conversation:
          | Conversation
          | undefined;

        for (let attempt = 0; attempt < 12; attempt += 1) {
          try {
            conversation =
              await createMentorshipConversation(
                mentorId,
              );

            break;
          } catch (error) {
            if (attempt === 11) {
              throw error;
            }

            // Give the payment webhook/RabbitMQ event a moment to grant Chat Service access.

            await new Promise((resolve) =>
              setTimeout(resolve, 1000),
            );
          }
        }

        if (cancelled || !conversation) {
          return;
        }

        setSelectedConversation(
          conversation,
        );

        setConversations((current) => {
          const exists = current.some(
            (item) =>
              item._id === conversation!._id,
          );

          return exists
            ? current
            : [conversation!, ...current];
        });

        navigate(
          `/candidate/chat/${mentorId}`,
          { replace: true },
        );
      } catch (error) {
        console.error(
          "Failed to open mentor conversation:",
          error,
        );

        toast.error(
          "Mentorship access is still being activated. Please try again in a moment.",
        );
      }
    };

    void openMentorConversation();

    return () => {
      cancelled = true;
    };
  }, [mentorId, navigate]);

  // load messages whenever the selected conversation changes 

  useEffect(() => {
    if (!selectedConversation) {
      return;
    }

    let cancelled = false;

    const loadMessages = async () => {
      try {
        const data =
          await getConversationMessages(
            selectedConversation._id,
          );

        if (!cancelled) {
          setMessages(data);
        }
      } catch (error) {
        console.error(
          "Failed to load messages:",
          error,
        );
      }
    };

    void loadMessages();

    return () => {
      cancelled = true;
    };
  }, [selectedConversation]);

  // creates one authenticated socket io conenction 

  useEffect(() => {
    let active = true;

    const connect = async () => {
      try {
        const socket =
          await createChatSocket();

        if (!active) {
          socket.disconnect();
          return;
        }

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
          "Chat socket connection failed:",
          error,
        );
      }
    };

    void connect();

    return () => {
      active = false;

      socketRef.current?.disconnect();

      socketRef.current = null;
    };
  }, []);

  /*
   * Join the currently selected conversation room.
   */
  useEffect(() => {
    if (
      !selectedConversation ||
      !socketRef.current
    ) {
      return;
    }

    socketRef.current.emit(
      SOCKET_EVENTS.JOIN_CONVERSATION,
      selectedConversation._id,
    );
  }, [selectedConversation]);

  const filteredConversations =
    useMemo(() => {
      const term =
        search.trim().toLowerCase();

      if (!term) {
        return conversations;
      }

      return conversations.filter(
        (conversation) =>
          conversation.participants.join(" ")
            .toLowerCase()
            .includes(term),
      );
    }, [conversations, search]);

  const handleSendMessage = async () => {
    const text = messageText.trim();

    if (
      !text ||
      !selectedConversation ||
      sending
    ) {
      return;
    }

    setSending(true);

    try {
      /*
       * Real-time message delivery.
       *
       * Chat Service persists the message first and
       * broadcasts RECEIVE_MESSAGE to the conversation room.
       */
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
    } catch (error) {
      console.error(
        "Failed to send message:",
        error,
      );

      toast.error(
        "Unable to send your message.",
      );
    } finally {
      setSending(false);
    }
  };

  const handleSelectConversation = (
    conversation: Conversation,
  ) => {
    const otherParticipant =
      conversation.participants.find(
        (id) => id !== mentorId,
      );

    setSelectedConversation(
      conversation,
    );

    /*
     * For the candidate, the other participant is
     * the mentor. Navigate to that mentor-specific URL.
     */
    if (otherParticipant) {
      navigate(
        `/candidate/chat/${otherParticipant}`,
      );
    }
  };

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-700">
            <Sparkles size={13} />
            Mentorship
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            My Mentors / Chats
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Continue your conversations with mentors
            you have subscribed to.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid min-h-[620px] lg:grid-cols-[320px_1fr]">
            {/* Conversation list */}
            <aside className="border-b border-slate-200 lg:border-b-0 lg:border-r">
              <div className="border-b border-slate-100 px-5 py-5">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value,
                      )
                    }
                    placeholder="Search mentors..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex h-[540px] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex h-[540px] items-center justify-center px-6 text-center">
                  <div className="max-w-[220px]">
                    <MessageCircle className="mx-auto text-violet-500" />

                    <h2 className="mt-4 text-sm font-semibold">
                      No mentor conversations yet
                    </h2>

                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      Subscribe to a mentor to start
                      your mentorship conversation.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="max-h-[540px] overflow-y-auto">
                  {filteredConversations.map(
                    (conversation) => {
                      const participantId =
                        conversation.participants.find(
                          (id) => id !== mentorId,
                        );

                      const active =
                        selectedConversation?._id ===
                        conversation._id;

                      return (
                        <button
                          key={conversation._id}
                          type="button"
                          onClick={() =>
                            handleSelectConversation(
                              conversation,
                            )
                          }
                          className={[
                            "flex w-full cursor-pointer items-center gap-3 border-b border-slate-100 px-5 py-4 text-left transition",
                            active
                              ? "bg-violet-50"
                              : "hover:bg-slate-50",
                          ].join(" ")}
                        >
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 font-semibold text-violet-700">
                            M
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {participantId
                                ? "Mentor"
                                : "Mentorship"}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Mentorship conversation
                            </p>
                          </div>
                        </button>
                      );
                    },
                  )}
                </div>
              )}
            </aside>

            {/* Chat window */}
            <main className="flex min-h-[620px] flex-col bg-white">
              {!selectedConversation ? (
                <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-violet-50/60 via-white to-indigo-50/50 p-8 text-center">
                  <div className="max-w-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-lg ring-1 ring-violet-100">
                      <MessageCircle size={28} />
                    </div>

                    <h2 className="mt-5 text-xl font-bold">
                      Your mentorship conversations
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Select a mentor to continue your
                      conversation.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Chat header */}
                  <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-100 font-semibold text-violet-700">
                      {mentor?.firstName?.[0] ?? "M"}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        {mentor
                          ? `${mentor.firstName ?? ""} ${
                              mentor.lastName ?? ""
                            }`.trim()
                          : "Mentor"}
                      </p>

                      <p className="text-xs text-emerald-600">
                        Mentorship active
                      </p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/50 p-6">
                    {messages.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-center">
                        <div>
                          <MessageCircle className="mx-auto text-violet-400" />

                          <p className="mt-3 text-sm font-medium text-slate-700">
                            Start your mentorship
                            conversation
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Ask your mentor anything.
                          </p>
                        </div>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isMine =
                          message.senderId !==
                          mentorId;

                        return (
                          <div
                            key={message._id}
                            className={`flex ${
                              isMine
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={[
                                "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                                isMine
                                  ? "rounded-br-md bg-violet-600 text-white"
                                  : "rounded-bl-md bg-white text-slate-700 shadow-sm ring-1 ring-slate-100",
                              ].join(" ")}
                            >
                              {message.deleted
                                ? "This message was deleted."
                                : message.text}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Message composer */}
                  <div className="border-t border-slate-100 bg-white p-4">
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
                            void handleSendMessage();
                          }
                        }}
                        rows={1}
                        placeholder="Type a message..."
                        className="min-h-11 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          void handleSendMessage()
                        }
                        disabled={
                          !messageText.trim() ||
                          sending
                        }
                        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Send message"
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
    </div>
  );
}