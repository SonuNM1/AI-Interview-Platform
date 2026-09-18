import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Check,
  CheckCheck,
  ClipboardCheck,
  Info,
  CalendarDays,
  XCircle,
} from "lucide-react";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type RecruiterNotification,
} from "../services/notification.api";
import { toast } from "sonner";

interface NotificationPopoverProps {
  onNavigate: (path: string) => void;
}

// Displays persistent recruiter notifications and provides read actions.
export function NotificationPopover({
  onNavigate,
}: NotificationPopoverProps) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["recruiter-notifications"],
    queryFn: getNotifications,
  });

  const notifications = data?.data ?? [];

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["recruiter-notifications"],
      });
    },

    onError: () => {
      toast.error("Failed to update notification.");
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["recruiter-notifications"],
      });
    },

    onError: () => {
      toast.error("Failed to mark notifications as read.");
    },
  });

  const getNotificationIcon = (
    type: RecruiterNotification["type"],
  ) => {
    switch (type) {
      case "INTERVIEW_COMPLETED":
        return (
          <ClipboardCheck className="h-4 w-4 text-violet-600" />
        );

      case "INTERVIEW_SCHEDULED":
        return (
          <CalendarDays className="h-4 w-4 text-indigo-600" />
        );

      case "INTERVIEW_CANCELLED":
        return <XCircle className="h-4 w-4 text-red-600" />;

      default:
        return <Info className="h-4 w-4 text-slate-500" />;
    }
  };

  const handleNotificationClick = (
    notification: RecruiterNotification,
  ) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification._id);
    }

    // Completed interview notifications take the recruiter to Interviews.
    if (
      notification.type === "INTERVIEW_COMPLETED" &&
      notification.metadata?.interviewId
    ) {
      onNavigate("/recruiter/interviews");
    }
  };

  return (
    <div
      className="
        absolute right-0 top-12 z-50
        w-[calc(100vw-2rem)] max-w-[380px]
        overflow-hidden
        rounded-2xl
        border border-slate-200
        bg-white
        shadow-2xl
        shadow-slate-900/10
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-violet-600" />

          <h3 className="text-sm font-semibold text-slate-900">
            Notifications
          </h3>

          {unreadCount > 0 && (
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
              {unreadCount}
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="
              flex cursor-pointer
              items-center gap-1
              text-xs font-medium
              text-slate-500
              transition
              hover:text-violet-600
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications */}
      <div className="max-h-[min(420px,calc(100vh-8rem))] overflow-y-auto">
        {isLoading ? (
          <div className="px-4 py-8 text-center text-sm text-slate-500">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">
              <Bell className="h-5 w-5 text-slate-400" />
            </div>

            <p className="mt-3 text-sm text-slate-500">
              No notifications
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification._id}
              type="button"
              onClick={() =>
                handleNotificationClick(notification)
              }
              className={`
                flex w-full cursor-pointer
                gap-3
                border-b border-slate-100
                px-4 py-4
                text-left
                transition
                hover:bg-slate-50
                ${
                  !notification.isRead
                    ? "bg-violet-50/40"
                    : ""
                }
              `}
            >
              {/* Icon */}
              <div
                className={`
                  mt-0.5
                  flex h-8 w-8 shrink-0
                  items-center justify-center
                  rounded-xl
                  ${
                    notification.type ===
                    "INTERVIEW_CANCELLED"
                      ? "bg-red-50"
                      : "bg-violet-50"
                  }
                `}
              >
                {getNotificationIcon(notification.type)}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">
                    {notification.title}
                  </p>

                  {!notification.isRead && (
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-600" />
                  )}
                </div>

                <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                  {notification.message}
                </p>

                <p className="mt-2 text-[10px] text-slate-400">
                  {new Date(
                    notification.createdAt,
                  ).toLocaleString()}
                </p>
              </div>

              {!notification.isRead && (
                <Check className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}