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
        return <ClipboardCheck className="h-4 w-4 text-[#D98260]" />;

      case "INTERVIEW_SCHEDULED":
        return <CalendarDays className="h-4 w-4 text-[#D98260]" />;

      case "INTERVIEW_CANCELLED":
        return <XCircle className="h-4 w-4 text-red-400" />;

      default:
        return <Info className="h-4 w-4 text-[#A9A29A]" />;
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
        overflow-hidden rounded-2xl
        border border-[#2F2B27]
        bg-[#181715]
        shadow-2xl
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-[#2F2B27] px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-[#D98260]" />

          <h3 className="text-sm font-semibold text-[#F2EDE4]">
            Notifications
          </h3>

          {unreadCount > 0 && (
            <span className="rounded-full bg-[#D98260] px-2 py-0.5 text-[10px] font-semibold text-white">
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
              flex cursor-pointer items-center gap-1
              text-xs text-[#A9A29A]
              transition hover:text-[#F2EDE4]
              disabled:cursor-not-allowed disabled:opacity-50
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
          <div className="px-4 py-8 text-center text-sm text-[#817A72]">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <Bell className="mx-auto h-6 w-6 text-[#6F6962]" />

            <p className="mt-2 text-sm text-[#817A72]">
              No notifications
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification._id}
              type="button"
              onClick={() => handleNotificationClick(notification)}
              className={`
                flex w-full cursor-pointer gap-3
                border-b border-[#2F2B27]
                px-4 py-4 text-left
                transition hover:bg-[#211F1C]
                ${
                  !notification.isRead
                    ? "bg-[#211D1A]"
                    : ""
                }
              `}
            >
              {/* Icon */}
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2A2521]">
                {getNotificationIcon(notification.type)}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-[#F2EDE4]">
                    {notification.title}
                  </p>

                  {!notification.isRead && (
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D98260]" />
                  )}
                </div>

                <p className="mt-1 break-words text-xs leading-5 text-[#817A72]">
                  {notification.message}
                </p>

                <p className="mt-2 text-[10px] text-[#6F6962]">
                  {new Date(
                    notification.createdAt,
                  ).toLocaleString()}
                </p>
              </div>

              {!notification.isRead && (
                <Check className="mt-1 h-4 w-4 shrink-0 text-[#6F6962]" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}