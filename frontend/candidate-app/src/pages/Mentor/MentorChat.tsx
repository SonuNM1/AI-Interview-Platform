import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import {
  getConversations,
  getCurrentUser,
  getMessages,
  getUserById,
  type ChatMessage,
  type ChatUser,
  type Conversation,
} from "../../services/chat.api";
import { useRef } from "react";
import { ConversationList } from "../../components/MentorChat/ConversationList";
import { ChatWindow } from "../../components/MentorChat/ChatWindow";
import { getMentorAvatarUrl } from "../../services/mentorship.api";

export function MentorChat() {
  const loadErrorShownRef = useRef(false);

  const navigate = useNavigate();
  const { mentorId } = useParams<{
    mentorId?: string;
  }>();

  const [currentUserId, setCurrentUserId] = useState("");

  const [conversations, setConversations] = useState<Conversation[]>([]);

  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  const [mentors, setMentors] = useState<Record<string, ChatUser>>({});

  const [mentorAvatarUrls, setMentorAvatarUrls] = useState<
    Record<string, string>
  >({});

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChat = async () => {
      try {
        setLoading(true);

        const [user, conversationData] = await Promise.all([
          getCurrentUser(),
          getConversations(),
        ]);

        setCurrentUserId(user.id);
        setConversations(conversationData);

        const mentorIds = conversationData.flatMap(
          (conversation) => conversation.participants,
        );

        const uniqueIds = [...new Set(mentorIds)].filter(
          (id) => id !== user.id,
        );

        const mentorResults = await Promise.all(
          uniqueIds.map(async (id) => {
            try {
              return await getUserById(id);
            } catch {
              return null;
            }
          }),
        );

        const mentorMap: Record<string, ChatUser> = {};

        uniqueIds.forEach((id, index) => {
          const mentor = mentorResults[index];

          if (mentor) {
            mentorMap[id] = mentor;
          }
        });

        setMentors(mentorMap);

        // Convert private avatar file IDs into temporary signed URLs for chat UI.
        const avatarEntries = await Promise.all(
          Object.entries(mentorMap).map(async ([id, mentor]) => {
            if (!mentor.avatarFileId) {
              return null;
            }

            try {
              const url = await getMentorAvatarUrl(mentor.avatarFileId);

              return [id, url] as const;
            } catch (error) {
              console.error(`Failed to load mentor avatar for ${id}:`, error);
              return null;
            }
          }),
        );

        const avatarMap: Record<string, string> = {};

        avatarEntries.forEach((entry) => {
          if (entry) {
            avatarMap[entry[0]] = entry[1];
          }
        });

        setMentorAvatarUrls(avatarMap);

        let conversation =
          conversationData.find((item) =>
            item.participants.includes(mentorId ?? ""),
          ) ?? null;

        if (!conversation) {
          conversation = conversationData[0] ?? null;
        }

        setSelectedConversation(conversation);
      } catch (error) {
        console.error("Load mentor chat error:", error);

        if (!loadErrorShownRef.current) {
          loadErrorShownRef.current = true;
          toast.error("Unable to load your mentor chats.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadChat();
  }, [mentorId]);

  useEffect(() => {
    if (!selectedConversation) {
      return;
    }

    const loadMessages = async () => {
      try {
        const data = await getMessages(selectedConversation._id);

        setMessages(data);
      } catch (error) {
        console.error("Load messages error:", error);

        toast.error("Unable to load messages.");
      }
    };

    loadMessages();
  }, [selectedConversation]);

  const handleSelectConversation = (conversation: Conversation) => {
    const participantId = conversation.participants.find((id) => mentors[id]);

    setConversations((current) =>
      current.map((item) =>
        item._id === conversation._id ? { ...item, unreadCount: 0 } : item,
      ),
    );

    setSelectedConversation(conversation);

    if (participantId) {
      navigate(`/candidate/chat/${participantId}`);
    }
  };

  const selectedMentor = useMemo(() => {
    if (!selectedConversation) {
      return null;
    }

    const mentorId = selectedConversation.participants.find(
      (id) => mentors[id],
    );

    return mentorId ? mentors[mentorId] : null;
  }, [selectedConversation, mentors]);

  // Get the signed avatar URL for the currently selected mentor.

  const selectedMentorAvatarUrl = selectedMentor
    ? mentorAvatarUrls[selectedMentor.id]
    : undefined;

  if (loading) {
    return (
      <div className="flex min-h-[620px] items-center justify-center">
        <p className="text-sm text-slate-500">Loading your conversations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 px-2 py-2 sm:px-4 sm:py-4 lg:px-5 lg:py-5">
      <div
        className="
          mx-auto
          max-w-7xl
          overflow-hidden
          rounded-3xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >
        <div className="flex h-[calc(100vh-120px)] min-h-0 flex-col lg:h-[calc(100vh-120px)] lg:flex-row">
          <ConversationList
            conversations={conversations}
            mentors={mentors}
            mentorAvatarUrls={mentorAvatarUrls}
            selectedConversationId={selectedConversation?._id ?? null}
            onSelect={handleSelectConversation}
          />

          <ChatWindow
            conversationId={selectedConversation?._id ?? null}
            mentor={selectedMentor}
            mentorAvatarUrl={selectedMentorAvatarUrl}
            currentUserId={currentUserId}
            messages={messages}
            setMessages={setMessages}
          />
        </div>
      </div>
    </div>
  );
}
