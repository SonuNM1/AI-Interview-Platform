import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import api from "../services/api";
import {
  getConversations,
  getConversationMessages,
  type ChatMessage,
  type ChatUser,
  type Conversation,
} from "../services/chat.api";
import { getFileSignedUrl } from "../services/mentor.api";
import { ConversationList } from "../components/Chat/ConversationList";
import { ChatWindow } from "../components/Chat/ChatWindow";

export default function Chat() {
  const [currentUserId, setCurrentUserId] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const [candidates, setCandidates] = useState<Record<string, ChatUser>>({});

  const [candidateAvatarUrls, setCandidateAvatarUrls] = useState<
    Record<string, string>
  >({});

  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChats = async () => {
      try {
        const [userResponse, conversationData] = await Promise.all([
          api.get("/users/me"),
          getConversations(),
        ]);

        const user = userResponse.data.data;

        setCurrentUserId(user.id);
        setConversations(conversationData);

        const candidateIds = [
          ...new Set(
            conversationData.flatMap(
              (conversation) => conversation.participants,
            ),
          ),
        ].filter((id) => id !== user.id);

        const candidateResults = await Promise.all(
          candidateIds.map(async (id) => {
            try {
              const response = await api.get(`/users/${id}`);
              return response.data.data as ChatUser;
            } catch {
              return null;
            }
          }),
        );

        const candidateMap: Record<string, ChatUser> = {};

        candidateIds.forEach((id, index) => {
          const candidate = candidateResults[index];

          if (candidate) {
            candidateMap[id] = candidate;
          }
        });

        setCandidates(candidateMap);

        // Convert private avatar file IDs into temporary signed URLs for chat UI.
        const avatarEntries = await Promise.all(
          Object.entries(candidateMap).map(async ([id, candidate]) => {
            if (!candidate.avatarFileId) {
              return null;
            }

            try {
              const url = await getFileSignedUrl(candidate.avatarFileId);

              return [id, url] as const;
            } catch (error) {
              console.error(
                `Failed to load candidate avatar for ${id}:`,
                error,
              );
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

        setCandidateAvatarUrls(avatarMap);

        setSelectedConversation(conversationData[0] ?? null);
      } catch (error) {
        console.error("Load mentor chats error:", error);
        toast.error("Unable to load your mentor chats.");
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, []);

  useEffect(() => {
    if (!selectedConversation) {
      return;
    }

    const loadMessages = async () => {
      try {
        const data = await getConversationMessages(selectedConversation._id);

        setMessages(data);
      } catch (error) {
        console.error("Load chat messages error:", error);
        toast.error("Unable to load messages.");
      }
    };

    loadMessages();
  }, [selectedConversation]);

  const selectedCandidate = useMemo(() => {
    if (!selectedConversation) {
      return null;
    }

    const candidateId = selectedConversation.participants.find(
      (id) => id !== currentUserId && candidates[id],
    );

    return candidateId ? candidates[candidateId] : null;
  }, [selectedConversation, candidates, currentUserId]);

  const selectedCandidateAvatarUrl = selectedCandidate
    ? candidateAvatarUrls[selectedCandidate.id]
    : undefined;

  if (loading) {
    return (
      <div className="flex min-h-[620px] items-center justify-center">
        <p className="text-sm text-slate-500">Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex h-[calc(100vh-120px)] min-h-0 flex-col lg:flex-row">
          <ConversationList
            conversations={conversations}
            candidates={candidates}
            candidateAvatarUrls={candidateAvatarUrls}
            selectedConversationId={selectedConversation?._id ?? null}
            onSelect={(conversation) => {
              setSelectedConversation(conversation);

              setConversations((current) =>
                current.map((item) =>
                  item._id === conversation._id
                    ? { ...item, unreadCount: 0 }
                    : item,
                ),
              );
            }}
          />

          <ChatWindow
            conversationId={selectedConversation?._id ?? null}
            candidate={selectedCandidate}
            candidateAvatarUrl={selectedCandidateAvatarUrl}
            currentUserId={currentUserId}
            messages={messages}
            setMessages={setMessages}
          />
        </div>
      </div>
    </div>
  );
}
