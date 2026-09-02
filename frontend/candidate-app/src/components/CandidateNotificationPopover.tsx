import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiCalendar, FiCheckCircle, FiClock, FiRefreshCw, FiXCircle } from "react-icons/fi";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type CandidateNotification
} from "../services/notification.api";

interface CandidateNotificationPopoverProps {
  onNavigate: (path: string) => void;
}

function formatInterviewTime(scheduledAt?: string) {
  if (!scheduledAt) return "";

  return new Date(scheduledAt).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getNotificationIcon(type: CandidateNotification["type"]) {

  switch (type) {
    case "INTERVIEW_SCHEDULED":
      return <FiCalendar className="h-4 w-4 text-[#D98260]" />;

    case "INTERVIEW_RESCHEDULED":
      return <FiRefreshCw className="h-4 w-4 text-[#D98260]" />;

    case "INTERVIEW_UPDATED":
      return <FiClock className="h-4 w-4 text-[#D98260]" />;

    case "INTERVIEW_CANCELLED":
      return <FiXCircle className="h-4 w-4 text-red-400" />;

    default:
      return <FiCheckCircle className="h-4 w-4 text-[#D98260]" />;
  }
}

export function CandidateNotificationPopover({
  onNavigate,
}: CandidateNotificationPopoverProps) {
  const queryClient = useQueryClient();

  const { data, isLoading} = useQuery({
    queryKey: ["candidate-notifications"],
    queryFn: getNotifications,
  });

  const notifications = data?.data ?? [] ; 

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["candidate-notifications"],
      });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["candidate-notifications"],
      });
    },
  });

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  const handleNotificationClick = (notification: CandidateNotification) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification._id);
    }

    if (notification.metadata?.interviewId) {
      onNavigate("/candidate/interviews");
    }
  };

  return (
    <div className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] max-w-[380px] overflow-hidden rounded-2xl border border-[#2F2B27] bg-[#181715] shadow-2xl">

      {/* Header */}
      
      <div className="flex items-center justify-between gap-3 border-b border-[#2F2B27] px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-[#F2EDE4]">
            Notifications
          </h2>

          {unreadCount > 0 && (
            <p className="mt-0.5 text-xs text-[#8F887F]">
              {unreadCount} unread
            </p>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="cursor-pointer text-xs font-medium text-[#D98260] hover:text-[#C96F4F] disabled:opacity-50"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="px-4 py-8 text-center text-sm text-[#8F887F]">
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-[#F2EDE4]">
            No notifications
          </p>

          <p className="mt-1 text-xs text-[#8F887F]">
            You're all caught up.
          </p>
        </div>
      ) : (
        <div className="max-h-[min(420px,calc(100vh-8rem))] overflow-y-auto">
          {notifications.map((notification) => (
            <button
              key={notification._id}
              type="button"
              onClick={() => handleNotificationClick(notification)}
              className={`w-full border-b border-[#2F2B27] px-4 py-4 text-left transition hover:bg-[#24211E] ${
                !notification.isRead ? "bg-[#211E1B]" : ""
              }`}
            >
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D98260]/10">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium text-[#D98260]">
                      {notification.title}
                    </p>

                    {!notification.isRead && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#D98260]" />
                    )}
                  </div>

                  <p className="mt-1 break-words text-sm font-semibold leading-5 text-[#F2EDE4]">
                    {notification.message}
                  </p>

                  {notification.metadata?.scheduledAt && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-[#A9A29A]">
                      <FiClock className="h-3.5 w-3.5" />

                      <span>
                        {formatInterviewTime(
                          notification.metadata.scheduledAt,
                        )}
                      </span>
                    </div>
                  )}

                  <p className="mt-2 text-xs text-[#6F6962]">
                    {new Date(notification.createdAt).toLocaleString([], {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}