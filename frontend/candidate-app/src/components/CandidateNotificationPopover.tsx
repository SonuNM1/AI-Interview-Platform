import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiXCircle,
} from "react-icons/fi";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type CandidateNotification,
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

function getNotificationIcon(
  type: CandidateNotification["type"],
) {
  switch (type) {
    case "INTERVIEW_SCHEDULED":
      return (
        <FiCalendar className="h-4 w-4 text-violet-600" />
      );

    case "INTERVIEW_RESCHEDULED":
      return (
        <FiRefreshCw className="h-4 w-4 text-violet-600" />
      );

    case "INTERVIEW_UPDATED":
      return (
        <FiClock className="h-4 w-4 text-violet-600" />
      );

    case "INTERVIEW_CANCELLED":
      return (
        <FiXCircle className="h-4 w-4 text-red-500" />
      );

    default:
      return (
        <FiCheckCircle className="h-4 w-4 text-violet-600" />
      );
  }
}

export function CandidateNotificationPopover({
  onNavigate,
}: CandidateNotificationPopoverProps) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["candidate-notifications"],
    queryFn: getNotifications,
  });

  const notifications = data?.data ?? [];

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

  const handleNotificationClick = (
    notification: CandidateNotification,
  ) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification._id);
    }

    if (notification.metadata?.interviewId) {
      onNavigate("/candidate/interviews");
    }
  };

  return (
    <div
      className="
        absolute
        right-0
        top-12
        z-50
        w-[calc(100vw-2rem)]
        max-w-[390px]
        overflow-hidden
        rounded-2xl
        border border-slate-200
        bg-white
        shadow-[0_20px_50px_rgba(15,23,42,0.12)]
      "
    >
      {/* =========================================================
          HEADER
      ========================================================= */}
      <div
        className="
          flex
          items-center
          justify-between
          gap-3
          border-b border-slate-100
          px-5
          py-4
        "
      >
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Notifications
          </h2>

          {unreadCount > 0 && (
            <p className="mt-1 text-xs text-slate-400">
              {unreadCount} unread
            </p>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() =>
              markAllReadMutation.mutate()
            }
            disabled={markAllReadMutation.isPending}
            className="
              cursor-pointer
              rounded-lg
              px-2
              py-1
              text-xs
              font-semibold
              text-violet-600
              transition
              hover:bg-violet-50
              hover:text-violet-700
              disabled:opacity-50
            "
          >
            Mark all read
          </button>
        )}
      </div>

      {/* =========================================================
          CONTENT
      ========================================================= */}
      {isLoading ? (
        <div className="px-5 py-10 text-center text-sm text-slate-400">
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <div
            className="
              mx-auto
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-br
              from-violet-100
              to-indigo-100
            "
          >
            <FiCheckCircle className="h-5 w-5 text-violet-600" />
          </div>

          <p className="mt-4 text-sm font-semibold text-slate-700">
            No notifications
          </p>

          <p className="mt-1 text-xs text-slate-400">
            You're all caught up.
          </p>
        </div>
      ) : (
        <div className="max-h-[min(420px,calc(100vh-8rem))] overflow-y-auto">
          {notifications.map((notification) => (
            <button
              key={notification._id}
              type="button"
              onClick={() =>
                handleNotificationClick(notification)
              }
              className={`
                w-full
                border-b
                border-slate-100
                px-5
                py-4
                text-left
                transition
                hover:bg-slate-50

                ${
                  !notification.isRead
                    ? "bg-violet-50/50"
                    : "bg-white"
                }
              `}
            >
              <div className="flex gap-3">
                {/* Notification icon */}
                <div
                  className="
                    mt-0.5
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-gradient-to-br
                    from-violet-100
                    to-indigo-100
                  "
                >
                  {getNotificationIcon(
                    notification.type,
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-violet-600">
                      {notification.title}
                    </p>

                    {!notification.isRead && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-violet-600" />
                    )}
                  </div>

                  <p className="mt-1 break-words text-sm font-semibold leading-5 text-slate-800">
                    {notification.message}
                  </p>

                  {notification.metadata?.scheduledAt && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <FiClock className="h-3.5 w-3.5" />

                      <span>
                        {formatInterviewTime(
                          notification.metadata
                            .scheduledAt,
                        )}
                      </span>
                    </div>
                  )}

                  <p className="mt-2 text-xs text-slate-400">
                    {new Date(
                      notification.createdAt,
                    ).toLocaleString([], {
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