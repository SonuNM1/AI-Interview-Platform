import { MessageCircle, Search } from "lucide-react";
import type { ChatUser, Conversation } from "../../services/chat.api";
import { useMemo, useState } from "react";

interface ConversationListProps {
  conversations: Conversation[];
  mentors: Record<string, ChatUser>;
  mentorAvatarUrls: Record<string, string>;
  selectedConversationId: string | null;
  onSelect: (conversation: Conversation) => void;
}

export function ConversationList({
  conversations,
  mentors,
  mentorAvatarUrls,
  selectedConversationId,
  onSelect,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const mentorId = conversation.participants.find((id) => mentors[id]);

      const mentor = mentorId ? mentors[mentorId] : null;

      const name = mentor
        ? `${mentor.firstName ?? ""} ${mentor.lastName ?? ""}`.trim() ||
          mentor.username ||
          "Mentor"
        : "Mentor";

      return name.toLowerCase().includes(query);
    });
  }, [conversations, mentors, searchQuery]);

  return (
    <aside
      className="
        flex
        w-full
        flex-col
        border-r
        border-slate-200
        bg-white
        lg:w-[310px]
        lg:shrink-0
      "
    >
      <div className="border-b border-slate-200 px-5 py-5">
        <h1 className="text-lg font-bold text-slate-900">My Mentors</h1>

        <p className="mt-1 text-xs text-slate-500">
          Your mentorship conversations
        </p>

        <div className="relative mt-4">
          <Search
            size={15}
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-slate-400
            "
          />

          <input
            placeholder="Search mentors..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="
              w-full
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              py-2.5
              pl-9
              pr-3
              text-sm
              outline-none
              focus:border-violet-300
              focus:bg-white
              focus:ring-4
              focus:ring-violet-100
            "
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <MessageCircle className="mx-auto text-slate-300" size={32} />

            <p className="mt-3 text-sm font-medium text-slate-700">
              {conversations.length === 0
                ? "No mentors yet"
                : "No mentors found"}
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              {conversations.length === 0
                ? "Subscribe to a mentor to start chatting."
                : "Try a different mentor name."}
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const mentorId = conversation.participants.find(
              (id) => mentors[id],
            );

            const mentor = mentorId ? mentors[mentorId] : null;

            const name = mentor
              ? `${mentor.firstName ?? ""} ${mentor.lastName ?? ""}`.trim() ||
                mentor.username ||
                "Mentor"
              : "Mentor";

            return (
              <button
                key={conversation._id}
                type="button"
                onClick={() => onSelect(conversation)}
                className={`
                    flex
                    w-full
                    cursor-pointer
                    items-center
                    gap-3
                    border-b
                    border-slate-100
                    px-5
                    py-4
                    text-left
                    transition
                    ${
                      selectedConversationId === conversation._id
                        ? "bg-violet-50"
                        : "hover:bg-slate-50"
                    }
                  `}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-violet-100 text-sm font-semibold text-violet-700">
                  {mentorId && mentorAvatarUrls[mentorId] ? (
                    <img
                      src={mentorAvatarUrls[mentorId]}
                      alt={`${name} profile`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    name.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {name}
                    </p>

                    {(conversation.unreadCount ?? 0) > 0 && (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-violet-600 px-1.5 text-[10px] font-bold text-white">
                        {conversation.unreadCount! > 99
                          ? "99+"
                          : conversation.unreadCount}
                      </span>
                    )}
                  </div>

                  <p className="mt-0.5 text-xs text-slate-400">Mentorship</p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
