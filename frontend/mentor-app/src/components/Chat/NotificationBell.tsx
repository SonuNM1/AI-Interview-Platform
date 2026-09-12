import { Bell, CheckCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  getNotifications, 
  markAllNotificationsAsRead,type Notification,
  markNotificationAsRead, 
} from "../../services/notification.api";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const knownIds = useRef<Set<string>>(new Set());

  const loadNotifications = async (showToast = false) => {
    try {
      const data = await getNotifications();

      if (showToast) {
        const newNotifications = data.filter(
          (notification) =>
            !knownIds.current.has(notification._id),
        );

        newNotifications.forEach((notification) => {
          if (!notification.isRead) {
            toast(notification.title, {
              description: notification.message,
            });
          }
        });
      }

      knownIds.current = new Set(
        data.map((notification) => notification._id),
      );

      setNotifications(data);
    } catch (error) {
      console.error("Load notifications error:", error);
    }
  };

  useEffect(() => {
    loadNotifications();

    const interval = window.setInterval(() => {
      loadNotifications(true);
    }, 15000);

    return () => window.clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.isRead) {
      return;
    }

    try {
      await markNotificationAsRead(notification._id);

      setNotifications((current) =>
        current.map((item) =>
          item._id === notification._id
            ? { ...item, isRead: true }
            : item,
        ),
      );
    } catch (error) {
      console.error("Mark notification read error:", error);
      toast.error("Unable to update notification.");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );
    } catch (error) {
      console.error("Mark all notifications error:", error);
      toast.error("Unable to update notifications.");
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-slate-500 transition hover:bg-violet-50 hover:text-violet-600"
        aria-label="Notifications"
      >
        <Bell size={20} />

        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-14 z-50 w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Notifications
              </h3>

              <p className="text-xs text-slate-400">
                {unreadCount} unread
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-800"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <Bell className="mx-auto text-slate-300" size={28} />

                <p className="mt-3 text-sm text-slate-600">
                  No notifications
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification._id}
                  type="button"
                  onClick={() =>
                    handleMarkAsRead(notification)
                  }
                  className={`w-full cursor-pointer border-b border-slate-100 px-4 py-4 text-left transition hover:bg-slate-50 ${
                    notification.isRead
                      ? "bg-white"
                      : "bg-violet-50/50"
                  }`}
                >
                  <div className="flex gap-3">
                    <span
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                        notification.isRead
                          ? "bg-slate-300"
                          : "bg-violet-500"
                      }`}
                    />

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {notification.title}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {notification.message}
                      </p>

                      <p className="mt-1.5 text-[10px] text-slate-400">
                        {new Date(
                          notification.createdAt,
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}